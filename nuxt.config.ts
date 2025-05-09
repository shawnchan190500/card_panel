// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Card Panel',
      link: [
        {
          rel: 'icon',
          type: 'image/jpeg',
          href: 'https://wafuu.com/cdn/shop/files/pokemon-master-ball-beach-ball-40cm-ahb-ma4-inflated-size-27cm-493948_540x.jpg?v=1721399691'
        }
      ]
    }
  }
})
