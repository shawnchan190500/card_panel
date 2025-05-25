<template>
  <div class="panel">
    <!-- Add loading and error states -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Loading data...</span>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="reloadPage" class="retry-btn">Retry</button>
    </div>

    <div class="panel-header">
      <slot name="header">
        <div class="header-content">
          <h2 class="panel-title">{{ title }}</h2>
          <div class="header-actions">
            <div class="date-range-filter">
              <input 
                type="date" 
                v-model="dateRange.start"
                class="date-input"
                @change="filterByDateRange"
              >
              <span>to</span>
              <input 
                type="date" 
                v-model="dateRange.end"
                class="date-input"
                @change="filterByDateRange"
              >
            </div>
            <button class="add-btn" @click="showAddDialog">
              Add Cards
            </button>
            <button class="remove-all-btn" @click="showRemoveAllDialog">
              Remove All
            </button>
            <button 
              class="update-price-btn" 
              @click="updateSellingPrices"
              title="Update selling prices: $1 → $8, $2 → $8, $3 → $8, $4 → $10, $5 → $12, $6 → $16, $7 → $16, $8 → $18, $9 → $22, $10 → $24, $11 → $26, $12 → $28 for records after 23/05/2025"
            >
              Update Prices
            </button>
            <button 
              class="export-btn" 
              @click="exportToExcel"
              title="Export data to Excel"
            >
              Export to Excel
            </button>
            <div class="column-filter-container">
              <button class="column-filter-btn" @click="toggleColumnFilter">
                Columns
              </button>
              <div v-if="showColumnFilter" class="column-filter">
                <div class="column-filter-header">
                  <span class="column-filter-title">Show/Hide Columns</span>
                  <button class="column-filter-close" @click="toggleColumnFilter">×</button>
                </div>
                <div class="column-filter-list">
                  <label class="column-filter-item check-all">
                    <input 
                      type="checkbox" 
                      :checked="isAllChecked"
                      @change="toggleAllColumns"
                      class="column-filter-checkbox"
                    >
                    <span class="column-filter-label">Check All</span>
                  </label>
                  <div class="column-filter-divider"></div>
                  <label v-for="(col, key) in columns" :key="key" class="column-filter-item">
                    <input 
                      type="checkbox" 
                      v-model="visibleColumns[key]"
                      class="column-filter-checkbox"
                    >
                    <span class="column-filter-label">{{ col.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          <div class="page-size-selector">
            <label for="pageSize">Show</label>
            <select 
              id="pageSize" 
              v-model="itemsPerPage"
              class="page-size-select"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
            <span>entries</span>
            </div>
          </div>
        </div>
      </slot>
    </div>
    <div class="panel-content">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in tableColumns" :key="col.key">
                <template v-if="col.key === 'createDate'">
                  <span 
                class="sortable" 
                    @click="sortBy('createDate')"
                    :class="{ 'sorted': sortKey === 'createDate' }"
              >
                    {{ col.label }}
                    <span class="sort-icon" v-if="sortKey === 'createDate'">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
                </span>
                </template>
                <template v-else>
                  {{ col.label }}
                </template>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="allData.length === 0">
              <td :colspan="tableColumns.length" class="no-data">No cards found. Add some cards to get started!</td>
            </tr>
            <tr 
              v-for="item in paginatedData" 
              :key="item.id" 
              class="table-row"
              :class="{ 
                'keep-row': item.keep,
                'sold-out-row': item.quantity === item.sold && item.quantity !== undefined && item.sold !== undefined,
                'out-of-range-row': isPriceOutOfRange(item.buyPrice)
              }"
              @click="handleRowClick(item)"
            >
              <td v-if="visibleColumns.id">#{{ item.id }}</td>
              <td v-if="visibleColumns.itemCode">
                <input 
                  type="text" 
                  :value="item.itemCode || ''"
                  @input="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    updateItemCode(item, target?.value ?? '');
                  }"
                  @click.stop
                  class="item-code-input"
                  :disabled="item.keep"
                  placeholder="Enter code"
                />
              </td>
              <td v-if="visibleColumns.cardNameJP">{{ item.cardNameJP }}</td>
              <td v-if="visibleColumns.cardNameCHI">{{ item.cardNameCHI }}</td>
              <td v-if="visibleColumns.quantity">
                <input 
                  type="number" 
                  :value="item.quantity || 1"
                  @input="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    updateQuantity(item, Number(target?.value ?? 1));
                  }"
                  @click.stop
                  class="quantity-input"
                  :disabled="item.keep"
                  min="1"
                />
              </td>
              <td v-if="visibleColumns.sold">
                <input 
                  type="number" 
                  v-model.number="item.sold" 
                  @click.stop
                  @input="updateSold(item)"
                  class="sold-input"
                  :disabled="item.keep"
                  min="0"
                />
              </td>
              <td v-if="visibleColumns.buyPriceJPY" class="buy-price">{{ item.buyPrice }}</td>
              <td v-if="visibleColumns.buyPriceHKD" class="buy-price">{{ formatHKDPrice(item.buyPrice) }}</td>
              <td v-if="visibleColumns.cost" class="cost">{{ calculateCost(item.buyPrice, item.quantity) }}</td>
              <td v-if="visibleColumns.sellPriceJPY" class="sell-price">
                <input 
                  type="number" 
                  v-model.number="item.sellPrice" 
                  @click.stop
                  @input="updateSellPrice(item)"
                  class="sell-price-input"
                  :disabled="item.keep"
                  min="0"
                />
              </td>
              <td v-if="visibleColumns.sellPriceHKD">
                <input 
                  type="number" 
                  :value="Math.round(item.sellPrice * 0.052)"
                  @input="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    updateSellPriceHKD(item, Number(target?.value ?? 0));
                  }"
                  @click.stop
                  class="sell-price-input"
                  :disabled="item.keep"
                  min="0"
                />
              </td>
              <td v-if="visibleColumns.totalProfit" class="total-profit">{{ calculateTotalProfit(item.buyPrice, item.sellPrice, item.sold) }}</td>
              <td v-if="visibleColumns.profitPercentage">{{ calculateProfitPercentage(item.buyPrice, item.sellPrice) }}</td>
              <td v-if="visibleColumns.profit" class="profit">{{ calculateProfit(item.buyPrice, item.sellPrice) }}</td>
              <td v-if="visibleColumns.createDate">{{ formatDate(item.createDate) }}</td>
              <td v-if="visibleColumns.image" class="image-cell">
                <a 
                  :href="getGoogleSearchUrl(item.cardNameJP)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  @click.stop
                  class="image-link"
                >
                  🖼️
                </a>
              </td>
              <td v-if="visibleColumns.keep" class="keep-cell">
                <input 
                  type="checkbox" 
                  :checked="item.keep"
                  @change="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    updateKeep(item, target?.checked ?? false);
                  }"
                  @click.stop
                  class="keep-checkbox"
                />
              </td>
              <td v-if="visibleColumns.stockTake" class="stock-take-cell">
                <input 
                  type="checkbox" 
                  :checked="item.stockTake"
                  @change="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    updateStockTake(item, target?.checked ?? false);
                  }"
                  @click.stop
                  class="stock-take-checkbox"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="total-profit-container">
          <div class="total-profit-text">
            Total Item Profit: <span class="profit-amount">HK$ {{ Math.round(totalProfit) }}</span>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="filteredData.length > 0">
        <div class="pagination-info">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredData.length }} entries
        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
            title="First Page"
          >
            ««
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
            title="Previous Page"
          >
            «
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            title="Next Page"
          >
            »
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
            title="Last Page"
          >
            »»
          </button>
        </div>
      </div>
      <div v-else class="no-results">
        No entries found
      </div>
    </div>

    <!-- Add Card Dialog -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>Add New Cards</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>Paste Card Data</label>
            <textarea 
              v-model="bulkInput"
              placeholder="Paste card data here..."
              rows="10"
              class="bulk-input"
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="closeDialog">Cancel</button>
            <button class="submit-btn" @click="parseAndAddCards">Add Cards</button>
          </div>
          </div>
          </div>
          </div>

    <!-- Add Edit Dialog -->
    <div v-if="showEditDialog" class="dialog-overlay">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>Edit Card</h3>
          <button class="close-btn" @click="closeEditDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>Card Name (JP)</label>
            <input 
              v-model="editForm.cardNameJP"
              type="text"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>Card Name (CHI)</label>
            <input 
              v-model="editForm.cardNameCHI"
              type="text"
              class="form-input"
            >
            </div>
          <div class="form-group">
            <label>Buying Price (JPY)</label>
            <input 
              v-model.number="editForm.buyPriceJPY"
              type="number"
              class="form-input"
              min="0"
              @input="syncBuyPrice('JPY', $event.target.value)"
            >
          </div>
          <div class="form-group">
            <label>Buying Price (HKD)</label>
            <input 
              v-model.number="editForm.buyPriceHKD"
              type="number"
              class="form-input"
              min="0"
              @input="syncBuyPrice('HKD', $event.target.value)"
            >
          </div>
          <div class="form-group">
            <label>Selling Price (JPY)</label>
            <input 
              v-model.number="editForm.sellPriceJPY"
              type="number"
              class="form-input"
              min="0"
              @input="syncSellPrice('JPY', $event.target.value)"
            >
          </div>
          <div class="form-group">
            <label>Selling Price (HKD)</label>
            <input 
              v-model.number="editForm.sellPriceHKD"
              type="number"
              class="form-input"
              min="0"
              @input="syncSellPrice('HKD', $event.target.value)"
            >
          </div>
          <div class="dialog-actions">
            <div class="dialog-actions-left">
              <button class="cancel-btn" @click="closeEditDialog">Cancel</button>
              <button class="remove-btn" @click="handleRemoveAll">Remove</button>
            </div>
            <button class="submit-btn" @click="handleEdit">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Remove All Confirmation Dialog -->
    <div v-if="showRemoveAllConfirmDialog" class="dialog-overlay">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>Confirm Remove All</h3>
          <button class="close-btn" @click="closeRemoveAllDialog">×</button>
        </div>
        <div class="dialog-content">
          <p class="warning-text">Are you sure you want to remove all cards? This action cannot be undone.</p>
          <div class="dialog-actions">
            <button class="cancel-btn" @click="closeRemoveAllDialog">Cancel</button>
            <button class="submit-btn danger" @click="handleRemoveAll">Remove All</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc,
  serverTimestamp,
  writeBatch,
  Firestore
} from 'firebase/firestore'
import * as XLSX from 'xlsx'

const props = defineProps<{
  title?: string,
  searchQuery?: string
}>()

const currentPage = ref(1)
const itemsPerPage = ref(25)
const sortKey = ref('createDate')
const sortOrder = ref('desc')

interface CardItem {
  id: string
  itemCode: string
  cardNameJP: string
  cardNameCHI: string
  buyPrice: number
  sellPrice: number
  createDate: any
  quantity?: number
  sold?: number
  keep?: boolean
  stockTake?: boolean
  [key: string]: any // Add index signature
}

const allData = ref<CardItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  console.log('Component mounted, initializing Firestore connection...')
  try {
    loading.value = true
    error.value = null

    // Verify Firestore is initialized
    if (!db) {
      throw new Error('Firestore is not initialized')
    }

    console.log('Creating Firestore query...')
    const cardsQuery = query(collection(db, 'cards'), orderBy('createDate', 'desc'))
    
    console.log('Setting up real-time listener...')
    const unsubscribe = onSnapshot(cardsQuery, 
      (snapshot) => {
        console.log('Received snapshot from Firestore:', snapshot.docs.length, 'documents')
        allData.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CardItem[]
        loading.value = false
        console.log('Data loaded successfully')
      },
      (err) => {
        console.error('Error in Firestore listener:', err)
        error.value = 'Failed to load data: ' + err.message
        loading.value = false
      }
    )

    // Cleanup subscription on component unmount
    onUnmounted(() => {
      console.log('Cleaning up Firestore listener...')
      unsubscribe()
    })
  } catch (err: unknown) {
    console.error('Error setting up Firestore connection:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    error.value = 'Failed to set up data connection: ' + errorMessage
    loading.value = false
  }
})

// Update the formatDate function
const formatDate = (date: any) => {
  if (!date) return '-'
  
  // Handle Firestore Timestamp
  if (date.toDate) {
    date = date.toDate()
  }
  
  // Handle string date
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  return date.toLocaleString('en-HK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// Watch for itemsPerPage changes and convert to number
watch(itemsPerPage, (newValue) => {
  itemsPerPage.value = Number(newValue)
  currentPage.value = 1
})

const sortBy = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

// Add date range filter
const dateRange = ref({
  start: '',
  end: ''
})

// Update column definitions
const columns = {
  id: { label: 'ID', key: 'id' },
  itemCode: { label: 'Item Code', key: 'itemCode' },
  cardNameJP: { label: 'Card Name (JP)', key: 'cardNameJP' },
  cardNameCHI: { label: 'Card Name (CHI)', key: 'cardNameCHI' },
  quantity: { label: 'In Stock', key: 'quantity' },
  sold: { label: 'Sold', key: 'sold' },
  buyPriceJPY: { label: 'Buying Price (JYP)', key: 'buyPriceJPY' },
  buyPriceHKD: { label: 'Buying Price (HKD)', key: 'buyPriceHKD' },
  cost: { label: 'Cost (HKD)', key: 'cost' },
  sellPriceJPY: { label: 'Selling Price (JYP)', key: 'sellPriceJPY' },
  sellPriceHKD: { label: 'Selling Price (HKD)', key: 'sellPriceHKD' },
  totalProfit: { label: 'Item Profit (HKD)', key: 'totalProfit' },
  profitPercentage: { label: 'Profit %', key: 'profitPercentage' },
  profit: { label: 'Profit (HKD)', key: 'profit' },
  createDate: { label: 'Create Date', key: 'createDate' },
  image: { label: 'Image', key: 'image' },
  keep: { label: 'Keep', key: 'keep' },
  stockTake: { label: 'Stock Take', key: 'stockTake' }
}

interface VisibleColumns {
  [key: string]: boolean
}

// Update visible columns type
const visibleColumns = ref<VisibleColumns>({
  id: false,
  itemCode: true,
  cardNameJP: false,
  cardNameCHI: true,
  quantity: true,
  sold: true,
  buyPriceJPY: false,
  buyPriceHKD: true,
  cost: false,
  sellPriceJPY: false,
  sellPriceHKD: true,
  totalProfit: true,
  profitPercentage: true,
  profit: false,
  createDate: true,
  image: true,
  keep: true,
  stockTake: true
})

// Add date range filter function
const filterByDateRange = () => {
  if (!dateRange.value.start || !dateRange.value.end) return
  
  const startDate = new Date(dateRange.value.start)
  const endDate = new Date(dateRange.value.end)
  endDate.setHours(23, 59, 59, 999) // Set to end of day
  
  filteredData.value = allData.value.filter(item => {
    const itemDate = item.createDate.toDate()
    return itemDate >= startDate && itemDate <= endDate
  })
}

// Update the filteredData computed property
const filteredData = computed(() => {
  let data = allData.value
  
  // Apply date range filter
  if (dateRange.value.start && dateRange.value.end) {
    const startDate = new Date(dateRange.value.start)
    const endDate = new Date(dateRange.value.end)
    endDate.setHours(23, 59, 59, 999)
    
    data = data.filter(item => {
      const itemDate = item.createDate.toDate()
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // Apply search filter
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase().trim()
    data = data.filter(item => 
      item.cardNameJP.toLowerCase().includes(query) ||
      item.cardNameCHI.toLowerCase().includes(query)
    )
  }
  
  // Apply sorting
  return data.sort((a, b) => {
    const aValue = a[sortKey.value]
    const bValue = b[sortKey.value]
    
    if (!aValue && !bValue) return 0
    if (!aValue) return 1
    if (!bValue) return -1
    
    let comparison = 0
    if (sortKey.value === 'createDate') {
      const aDate = aValue.toDate ? aValue.toDate() : new Date(aValue)
      const bDate = bValue.toDate ? bValue.toDate() : new Date(bValue)
      comparison = aDate.getTime() - bDate.getTime()
    } else {
      comparison = String(aValue).localeCompare(String(bValue))
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / Number(itemsPerPage.value)))

const paginatedData = computed(() => {
  const pageSize = Number(itemsPerPage.value)
  const start = (currentPage.value - 1) * pageSize
  const end = Math.min(start + pageSize, filteredData.value.length)
  return filteredData.value.slice(start, end)
})

const paginationStart = computed(() => {
  if (filteredData.value.length === 0) return 0
  return (currentPage.value - 1) * Number(itemsPerPage.value) + 1
})

const paginationEnd = computed(() => {
  const pageSize = Number(itemsPerPage.value)
  const end = Math.min(currentPage.value * pageSize, filteredData.value.length)
  return end
})

// Reset to first page when search query changes
watch(() => props.searchQuery, () => {
  currentPage.value = 1
})

const removeItem = async (id: string) => {
  try {
    await deleteDoc(doc(db!, 'cards', id))
  } catch (err: unknown) {
    console.error('Error removing item:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error('Failed to remove item: ' + errorMessage)
  }
}

const showDialog = ref(false)
const bulkInput = ref('')

const parseAndAddCards = async () => {
  if (!bulkInput.value.trim()) {
    alert('Please paste card data')
    return
  }

  try {
    console.log('Starting to parse card data...')
    const lines = bulkInput.value.split('\n')
    const cards: Partial<CardItem>[] = []
    let currentCard: Partial<CardItem> = {}

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      console.log('Processing line:', line)
      
      if (line === '產品名稱') {
        if (Object.keys(currentCard).length > 0) {
          console.log('Adding card to batch:', currentCard)
          cards.push(currentCard)
        }
        currentCard = {
          createDate: serverTimestamp(),
          itemCode: '' // Initialize empty item code
        }
        currentCard.cardNameJP = lines[i + 1].trim()
        currentCard.cardNameCHI = currentCard.cardNameJP
        console.log('Card name:', currentCard.cardNameJP)
      } else if (line === '數量') {
        const quantity = parseInt(lines[i + 1].trim())
        currentCard.quantity = isNaN(quantity) ? 1 : quantity
        console.log('Quantity:', currentCard.quantity)
      } else if (line === '單件售價 (JPY)') {
        const priceText = lines[i + 1].trim()
        const buyPrice = parseInt(priceText.replace('JP¥', '').trim())
        
        if (isNaN(buyPrice)) {
          throw new Error('Invalid price format')
        }
        
        currentCard.buyPrice = buyPrice
        console.log('Buy price:', currentCard.buyPrice)
        
        // Calculate sell price based on buy price ranges
        if (currentCard.buyPrice <= 50) {
          currentCard.sellPrice = Math.round(currentCard.buyPrice * 3)
        } else if (currentCard.buyPrice <= 200) {
          currentCard.sellPrice = Math.round(currentCard.buyPrice * 2.5)
        } else if (currentCard.buyPrice <= 400) {
          currentCard.sellPrice = Math.round(currentCard.buyPrice * 2)
        } else if (currentCard.buyPrice < 600) {
          currentCard.sellPrice = Math.round(currentCard.buyPrice * 1.8)
        } else {
          currentCard.sellPrice = Math.round(currentCard.buyPrice * 1.45)
        }
        console.log('Sell price:', currentCard.sellPrice)
      }
    }

    // Add the last card
    if (Object.keys(currentCard).length > 0) {
      console.log('Adding final card to batch:', currentCard)
      cards.push(currentCard)
    }

    console.log('Total cards to add:', cards.length)

    // Add all cards to Firestore
    for (const card of cards) {
      console.log('Adding card to Firestore:', card)
      await addDoc(collection(db!, 'cards'), card)
    }
    
    console.log('All cards added successfully')
    closeDialog()
  } catch (err: unknown) {
    console.error('Error in parseAndAddCards:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to add cards: ' + errorMessage)
  }
}

// Add new refs for edit dialog
const showEditDialog = ref(false)
const editingItem = ref<CardItem | null>(null)
const editForm = ref({
  cardNameJP: '',
  cardNameCHI: '',
  buyPriceJPY: 0,
  buyPriceHKD: 0,
  sellPriceJPY: 0,
  sellPriceHKD: 0
})

// Add edit functions
const handleRowClick = (item: CardItem) => {
  editingItem.value = item
  editForm.value = {
    cardNameJP: item.cardNameJP,
    cardNameCHI: item.cardNameCHI,
    buyPriceJPY: item.buyPrice,
    buyPriceHKD: Math.round(item.buyPrice * 0.052),
    sellPriceJPY: item.sellPrice,
    sellPriceHKD: Math.round(item.sellPrice * 0.052)
  }
  showEditDialog.value = true
}

const handleEdit = async () => {
  if (!editingItem.value) return

  try {
    const docRef = doc(db!, 'cards', editingItem.value.id)
    await updateDoc(docRef, {
      cardNameJP: editForm.value.cardNameJP,
      cardNameCHI: editForm.value.cardNameCHI,
      buyPrice: editForm.value.buyPriceJPY,
      sellPrice: editForm.value.sellPriceJPY,
      updateDate: serverTimestamp()
    })
    showEditDialog.value = false
    editingItem.value = null
  } catch (err: unknown) {
    console.error('Error updating card:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update card: ' + errorMessage)
  }
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingItem.value = null
}

// Add the HKD price formatter function
const formatHKDPrice = (jpyPrice: number): string => {
  const hkdPrice = Math.round(jpyPrice * 0.052)
  return `HK$ ${hkdPrice}`
}

// Add new refs for remove all dialog
const showRemoveAllConfirmDialog = ref(false)

// Add remove all functions
const showRemoveAllDialog = () => {
  showRemoveAllConfirmDialog.value = true
}

const closeRemoveAllDialog = () => {
  showRemoveAllConfirmDialog.value = false
}

const handleRemoveAll = async () => {
  try {
    const batch = writeBatch(db!)
    allData.value.forEach(item => {
      const docRef = doc(db!, 'cards', item.id)
      batch.delete(docRef)
    })
    await batch.commit()
    closeRemoveAllDialog()
  } catch (err: unknown) {
    console.error('Error removing all items:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to remove all items: ' + errorMessage)
  }
}

// Update profit percentage calculation function
const calculateProfitPercentage = (buyPrice: number, sellPrice: number): string => {
  const buyHKD = buyPrice * 0.052
  const sellHKD = sellPrice * 0.052
  const profitPercentage = ((sellHKD - buyHKD) / buyHKD) * 100
  return `${Math.round(profitPercentage + 100)}%`
}

// Update profit calculation function
const calculateProfit = (buyPrice: number, sellPrice: number): string => {
  const buyHKD = buyPrice * 0.052
  const sellHKD = sellPrice * 0.052
  const profit = sellHKD - buyHKD
  return `HK$ ${Math.round(profit)}`
}

// Update total profit calculation
const calculateTotalProfit = (buyPrice: number, sellPrice: number, sold: number = 0): string => {
  const buyHKD = buyPrice * 0.052
  const sellHKD = sellPrice * 0.052
  const totalProfit = (sellHKD - buyHKD) * sold
  return `HK$ ${Math.round(totalProfit)}`
}

// Add updateSellPrice function
const updateSellPrice = async (item: CardItem) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      sellPrice: item.sellPrice,
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating sell price:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update sell price: ' + errorMessage)
  }
}

// Add column filter functionality
const showColumnFilter = ref(false)
const toggleColumnFilter = () => {
  showColumnFilter.value = !showColumnFilter.value
}

// Update the table columns computed property
const tableColumns = computed(() => {
  return Object.entries(columns)
    .filter(([key]) => visibleColumns.value[key])
    .map(([key, value]) => value)
})

// Add computed property for check all state
const isAllChecked = computed(() => {
  return Object.values(visibleColumns.value).every(value => value === true)
})

// Add toggle all function
const toggleAllColumns = () => {
  const newValue = !isAllChecked.value
  Object.keys(visibleColumns.value).forEach(key => {
    visibleColumns.value[key] = newValue
  })
}

// Add these functions
const showAddDialog = () => {
  console.log('Opening add dialog')
  showDialog.value = true
}

const closeDialog = () => {
  console.log('Closing dialog')
  showDialog.value = false
  bulkInput.value = ''
}

// Add total profit calculation
const totalProfit = computed(() => {
  return allData.value.reduce((total, item) => {
    const buyHKD = item.buyPrice * 0.052
    const sellHKD = item.sellPrice * 0.052
    const sold = item.sold || 0
    return total + ((sellHKD - buyHKD) * sold)
  }, 0)
})

// Add function to generate Google search URL
const getGoogleSearchUrl = (cardName: string) => {
  const searchQuery = encodeURIComponent(`${cardName} ポケモンカード`)
  return `https://www.google.com/search?q=${searchQuery}&tbm=isch`
}

// Add new computed properties for cost and total profit
const calculateCost = (buyPrice: number, quantity: number = 1): string => {
  const buyHKD = buyPrice * 0.052
  const cost = buyHKD * quantity
  return `HK$ ${Math.round(cost)}`
}

// Add updateSold function
const updateSold = async (item: CardItem) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      sold: item.sold || 0,
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating sold quantity:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update sold quantity: ' + errorMessage)
  }
}

// Add HKD to JPY conversion function
const convertHKDToJPY = (hkdPrice: number): number => {
  return Math.round(hkdPrice / 0.052)
}

// Update event handlers to accept primitive values
const updateItemCode = async (item: CardItem, value: string) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      itemCode: value,
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating item code:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update item code: ' + errorMessage)
  }
}

const updateQuantity = async (item: CardItem, value: number) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      quantity: value,
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating quantity:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update quantity: ' + errorMessage)
  }
}

const updateSellPriceHKD = async (item: CardItem, value: number) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      sellPrice: convertHKDToJPY(value),
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating sell price:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update sell price: ' + errorMessage)
  }
}

// Add price sync functions
const syncBuyPrice = (currency: 'JPY' | 'HKD', value: number) => {
  if (currency === 'JPY') {
    editForm.value.buyPriceJPY = value
    editForm.value.buyPriceHKD = Math.round(value * 0.052)
  } else {
    editForm.value.buyPriceHKD = value
    editForm.value.buyPriceJPY = Math.round(value / 0.052)
  }
}

const syncSellPrice = (currency: 'JPY' | 'HKD', value: number) => {
  if (currency === 'JPY') {
    editForm.value.sellPriceJPY = value
    editForm.value.sellPriceHKD = Math.round(value * 0.052)
  } else {
    editForm.value.sellPriceHKD = value
    editForm.value.sellPriceJPY = Math.round(value / 0.052)
  }
}

// Add updateKeep function
const updateKeep = async (item: CardItem, keep: boolean) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      keep: keep,
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating keep status:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update keep status: ' + errorMessage)
  }
}

// Add reloadPage function
const reloadPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

// Add type for input event
type InputEventWithTarget = {
  target: HTMLInputElement;
} & Event;

// Add handleRemove function
const handleRemove = async () => {
  if (!editingItem.value) return
  
  try {
    await removeItem(editingItem.value.id)
    closeEditDialog()
  } catch (err: unknown) {
    console.error('Error removing item:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to remove item: ' + errorMessage)
  }
}

// Add updateStockTake function
const updateStockTake = async (item: CardItem, stockTake: boolean) => {
  try {
    const docRef = doc(db!, 'cards', item.id)
    await updateDoc(docRef, {
      stockTake: stockTake,
      updateDate: serverTimestamp()
    })
  } catch (err: unknown) {
    console.error('Error updating stock take status:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update stock take status: ' + errorMessage)
  }
}

// Update updateSellingPrices function
const updateSellingPrices = async () => {
  try {
    const targetDate = new Date('2025-05-23')
    const batch = writeBatch(db!)
    const updateCounts = {
      '1to8': 0,
      '2to8': 0,
      '3to8': 0,
      '4to10': 0,
      '5to12': 0,
      '6to16': 0,
      '7to16': 0,
      '8to18': 0,
      '9to22': 0,
      '10to24': 0,
      '11to26': 0,
      '12to28': 0
    }

    // Filter records that meet the criteria
    const recordsToUpdate = allData.value.filter(item => {
      const createDate = item.createDate.toDate()
      const buyPriceHKD = Math.round(item.buyPrice * 0.052)
      return createDate >= targetDate && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(buyPriceHKD)
    })

    // Update each matching record
    for (const item of recordsToUpdate) {
      const docRef = doc(db!, 'cards', item.id)
      const buyPriceHKD = Math.round(item.buyPrice * 0.052)
      let newSellPriceJPY: number

      switch (buyPriceHKD) {
        case 1:
          newSellPriceJPY = Math.round(8 / 0.052)
          updateCounts['1to8']++
          break
        case 2:
          newSellPriceJPY = Math.round(8 / 0.052)
          updateCounts['2to8']++
          break
        case 3:
          newSellPriceJPY = Math.round(8 / 0.052)
          updateCounts['3to8']++
          break
        case 4:
          newSellPriceJPY = Math.round(10 / 0.052)
          updateCounts['4to10']++
          break
        case 5:
          newSellPriceJPY = Math.round(12 / 0.052)
          updateCounts['5to12']++
          break
        case 6:
          newSellPriceJPY = Math.round(16 / 0.052)
          updateCounts['6to16']++
          break
        case 7:
          newSellPriceJPY = Math.round(16 / 0.052)
          updateCounts['7to16']++
          break
        case 8:
          newSellPriceJPY = Math.round(18 / 0.052)
          updateCounts['8to18']++
          break
        case 9:
          newSellPriceJPY = Math.round(22 / 0.052)
          updateCounts['9to22']++
          break
        case 10:
          newSellPriceJPY = Math.round(24 / 0.052)
          updateCounts['10to24']++
          break
        case 11:
          newSellPriceJPY = Math.round(26 / 0.052)
          updateCounts['11to26']++
          break
        case 12:
          newSellPriceJPY = Math.round(28 / 0.052)
          updateCounts['12to28']++
          break
        default:
          continue
      }

      batch.update(docRef, {
        sellPrice: newSellPriceJPY,
        updateDate: serverTimestamp()
      })
    }

    const hasUpdates = Object.values(updateCounts).some(count => count > 0)
    if (hasUpdates) {
      await batch.commit()
      let message = 'Successfully updated:'
      if (updateCounts['1to8'] > 0) message += `\n- ${updateCounts['1to8']} records from $1 to $8`
      if (updateCounts['2to8'] > 0) message += `\n- ${updateCounts['2to8']} records from $2 to $8`
      if (updateCounts['3to8'] > 0) message += `\n- ${updateCounts['3to8']} records from $3 to $8`
      if (updateCounts['4to10'] > 0) message += `\n- ${updateCounts['4to10']} records from $4 to $10`
      if (updateCounts['5to12'] > 0) message += `\n- ${updateCounts['5to12']} records from $5 to $12`
      if (updateCounts['6to16'] > 0) message += `\n- ${updateCounts['6to16']} records from $6 to $16`
      if (updateCounts['7to16'] > 0) message += `\n- ${updateCounts['7to16']} records from $7 to $16`
      if (updateCounts['8to18'] > 0) message += `\n- ${updateCounts['8to18']} records from $8 to $18`
      if (updateCounts['9to22'] > 0) message += `\n- ${updateCounts['9to22']} records from $9 to $22`
      if (updateCounts['10to24'] > 0) message += `\n- ${updateCounts['10to24']} records from $10 to $24`
      if (updateCounts['11to26'] > 0) message += `\n- ${updateCounts['11to26']} records from $11 to $26`
      if (updateCounts['12to28'] > 0) message += `\n- ${updateCounts['12to28']} records from $12 to $28`
      alert(message)
    } else {
      alert('No records found matching the criteria.')
    }
  } catch (err: unknown) {
    console.error('Error updating selling prices:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to update selling prices: ' + errorMessage)
  }
}

// Add this function before the template section
const isPriceOutOfRange = (buyPrice: number): boolean => {
  const buyPriceHKD = Math.round(buyPrice * 0.052)
  return buyPriceHKD < 1 || buyPriceHKD > 12
}

// Add export function after other functions
const exportToExcel = () => {
  try {
    // Filter out items where keep is true
    const filteredItems = allData.value.filter(item => !item.keep)

    // Prepare the data for export with only specified columns
    const exportData = filteredItems.map(item => ({
      'Item Code': item.itemCode || '',
      'Card Name (CHI)': item.cardNameCHI,
      'In Stock': item.quantity || 1,
      'Selling Price (HKD)': Math.round(item.sellPrice * 0.052),
      'Created At': formatDate(item.createDate)
    }))

    if (exportData.length === 0) {
      alert('No data to export (all items are marked as keep)')
      return
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths for the specific columns
    const colWidths = [
      { wch: 15 },  // Item Code
      { wch: 30 },  // Card Name (CHI)
      { wch: 10 },  // In Stock
      { wch: 15 },  // Selling Price (HKD)
      { wch: 20 }   // Created At
    ]
    ws['!cols'] = colWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Card Data')

    // Generate Excel file
    const fileName = `card_data_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    alert(`Successfully exported ${exportData.length} items!`)
  } catch (err: unknown) {
    console.error('Error exporting data:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    alert('Failed to export data: ' + errorMessage)
  }
}
</script>

<style scoped>
.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 90vh;
  width: 90vw;
  display: flex;
  flex-direction: column;
  margin: auto;
}

.panel:hover {
  transform: none;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.panel-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.panel-content {
  padding: 1.25rem;
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1;
  overflow: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 800px;
}

.data-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  vertical-align: middle;
}

.table-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f3f4f6;
}

.keep-row {
  background-color: #e0f2fe !important; /* Light blue background */
}

.keep-row:hover {
  background-color: #bae6fd !important; /* Slightly darker blue on hover */
}

.sold-out-row {
  background-color: #fee2e2 !important; /* Light red background */
}

.sold-out-row:hover {
  background-color: #fecaca !important; /* Slightly darker red on hover */
}

/* When both keep and sold-out conditions are true, keep takes precedence */
.keep-row.sold-out-row {
  background-color: #e0f2fe !important;
}

.keep-row.sold-out-row:hover {
  background-color: #bae6fd !important;
}

.out-of-range-row {
  background-color: #fef9c3 !important; /* Light yellow background */
}

.out-of-range-row:hover {
  background-color: #fef08a !important; /* Slightly darker yellow on hover */
}

/* Update the existing row style combinations */
.keep-row.out-of-range-row {
  background-color: #e0f2fe !important; /* Keep takes precedence over out-of-range */
}

.keep-row.out-of-range-row:hover {
  background-color: #bae6fd !important;
}

.sold-out-row.out-of-range-row {
  background-color: #fee2e2 !important; /* Sold-out takes precedence over out-of-range */
}

.sold-out-row.out-of-range-row:hover {
  background-color: #fecaca !important;
}

.keep-row.sold-out-row.out-of-range-row {
  background-color: #e0f2fe !important; /* Keep takes highest precedence */
}

.keep-row.sold-out-row.out-of-range-row:hover {
  background-color: #bae6fd !important;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 1.5rem;
}

.sortable:hover {
  background-color: #f3f4f6;
}

.sorted {
  background-color: #f3f4f6;
}

.sort-icon {
  position: absolute;
  right: 0.5rem;
  color: #6b7280;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.add-btn {
  padding: 0.5rem 1.25rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background-color: #1d4ed8;
}

.remove-btn {
  padding: 0.25rem 0.75rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 2.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0 0.5rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc2626;
  margin-top: 1rem;
  text-align: center;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  }
  
.retry-btn:hover {
  background: #b91c1c;
  }
  
.no-data {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
}

/* Dialog styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 95vw;
  max-width: 800px;
  max-height: 95vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  position: relative;
  margin: auto;
}

.dialog-header {
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border-radius: 12px 12px 0 0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.dialog-content {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dialog-actions-left {
  display: flex;
  gap: 1rem;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background-color: #1d4ed8;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.bulk-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  font-family: monospace;
  resize: vertical;
  min-height: 300px;
  line-height: 1.5;
}

/* Custom scrollbar */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.remove-all-btn {
  padding: 0.5rem 1.25rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 1rem;
}

.remove-all-btn:hover {
  background-color: #b91c1c;
}

.warning-text {
  color: #dc2626;
  font-size: 1.1rem;
  text-align: center;
  margin: 1rem 0;
}

.submit-btn.danger {
  background-color: #dc2626;
}

.submit-btn.danger:hover {
  background-color: #b91c1c;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f9fafb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.page-size-selector label {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.page-size-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* Column filter styles */
.column-filter {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 50;
  min-width: 200px;
}

.column-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.column-filter-title {
  font-weight: 600;
  color: #111827;
}

.column-filter-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.column-filter-close:hover {
  color: #111827;
}

.column-filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.column-filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-filter-checkbox {
  width: 1rem;
  height: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
}

.column-filter-label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.column-filter-container {
  position: relative;
  margin-right: 1rem;
}

.column-filter-btn {
  padding: 0.5rem 1.25rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.column-filter-btn:hover {
  background-color: #e5e7eb;
}

.column-filter-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.5rem 0;
}

.check-all {
  font-weight: 600;
  color: #111827;
}

.buy-price {
  color: #dc2626;
  font-weight: 600;
}

.sell-price {
  color: #16a34a;
  font-weight: 600;
}

.date-range-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
}

.date-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.profit {
  color: #16a34a;
  font-weight: 600;
}

.total-profit {
  color: #16a34a;
  font-weight: 600;
}

.profit-amount {
  color: #16a34a;
  font-weight: 700;
  font-size: 1.2rem;
  margin-left: 0.5rem;
}

.image-cell {
  padding: 0.5rem;
  text-align: center;
}

.image-link {
  display: inline-block;
  text-decoration: none;
  color: #2563eb;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.image-link:hover {
  color: #1d4ed8;
}

.sold-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: right;
}

.sold-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.cost {
  color: #dc2626;
  font-weight: 600;
}

.sell-price-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: right;
}

.sell-price-input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
}

.quantity-input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: right;
}

.quantity-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.item-code-input {
  width: 100px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.875rem;
}

.item-code-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.total-profit-container {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  background-color: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.total-profit-text {
  font-size: 1.1rem;
  font-weight: 500;
}

.keep-cell {
  text-align: center;
  padding: 0.5rem;
}

.keep-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
}

.keep-checkbox:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Add styles for disabled inputs */
.item-code-input:disabled,
.quantity-input:disabled,
.sold-input:disabled,
.sell-price-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
  border-color: #d1d5db;
}

.stock-take-cell {
  text-align: center;
  padding: 0.5rem;
}

.stock-take-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #16a34a; /* Green color for stock take checkbox */
}

.stock-take-checkbox:focus {
  outline: 2px solid #16a34a;
  outline-offset: 2px;
}

.update-price-btn {
  padding: 0.5rem 1.25rem;
  background-color: #16a34a;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 1rem;
}

.update-price-btn:hover {
  background-color: #15803d;
}

.export-btn {
  padding: 0.5rem 1.25rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 1rem;
}

.export-btn:hover {
  background-color: #1d4ed8;
}
</style> 