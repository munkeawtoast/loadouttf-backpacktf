const qualities = [
  {
    id: 0,
    name: 'Normal',
    color: '#B2B2B2',
  },
  {
    id: 1,
    name: 'Genuine',
    color: '#4D7455',
  },
  {
    id: 3,
    name: 'Vintage',
    color: '#476291',
    hasCraftable: true,
  },
  {
    id: 5,
    name: 'Unusual',
    color: '8650AC',
    hasPriceIndex: true,
  },
  {
    id: 6,
    name: 'Unique',
    color: '#FFD700',
    hasCraftable: true,
  },
  {
    id: 7,
    name: 'Community',
    color: '#70B04A',
  },
  {
    id: 8,
    name: 'Valve',
    color: '#A50F79',
  },
  {
    id: 9,
    name: 'Self-Made',
    color: '#70B04A',
  },
  // {
  //   id: 10,
  //   name: "Customized",
  //   color: "",
  // },
  {
    id: 11,
    name: 'Strange',
    color: '',
  },
  // {
  //   id: 12,
  //   name: "Completed",
  //   color: "",
  // },
  {
    id: 13,
    name: 'Haunted',
    color: '#38F3AB',
  },
  {
    id: 14,
    name: "Collector's",
    color: '#AA0000',
  },
]

const target = 'item-manager-item'
const priceContainerClassName = 'price-tag-container'

const currencies = [
  {
    name: 'metal',
    imageUrl:
      'https://steamcdn-a.akamaihd.net/apps/440/icons/pile_of_junk3.6f7e42fae0507065287c7b5c51aa05c2420161ba.png',
  },
  {
    name: 'keys',
    imageUrl:
      'https://steamcdn-a.akamaihd.net/apps/440/icons/key.be0a5e2cda3a039132c35b67319829d785e50352.png',
  },
]

/**
 * Backpack.tf documentation: https://backpack.tf/api/index.html
 */

var API_KEY

const itemPrices = new Map()
var ready = false

function setReady() {
  console.log('price filled and ready!')
  ready = true
}

async function fillPrice(itemPrices) {
  const url = new URL('https://backpack.tf/api/IGetPrices/v4')
  url.searchParams.append('key', API_KEY)

  try {
    const response = await window.fetch(url)
    const responseObject = await response.json()
    const rawItemArray = Object.entries(responseObject.response.items)

    rawItemArray.forEach(([itemName, rawPricing]) => {
      itemPrices.set(
        itemName,
        Object.entries(rawPricing.prices).map(([key, val]) => ({
          quality: key,
          pricings: val.Tradable,
        }))
      )
    })
    addPricingTags()
  } catch {
    window.alert('Bad API key or server is down. refresh page to continue')
  }
}

function getPricesElement(itemName, qualAndPricesArray) {
  const makeTags = ({ itemName, quality, price, craftable }) => {
    if (price.currency === 'hat' || !price.value) {
      return
    }
    const tag = document.createElement('a')
    const image = document.createElement('img')
    const span = document.createElement('span')

    tag.target = '_blank'
    tag.classList.add('price-tag-tag', `price-tag-tag-quality_${quality.id}`)
    image.classList.add('price-tag-currency_img')

    if (!craftable) {
      tag.classList.add('price-tag-container-non_craftable')
    }

    image.src = currencies.find(
      (curren) => curren.name == price.currency
    ).imageUrl

    const backpackTfUrlObject = new URL('https://next.backpack.tf/stats')
    backpackTfUrlObject.searchParams.append('item', itemName)
    backpackTfUrlObject.searchParams.append('quality', quality.name)

    if (quality.name === 'Unique') {
      backpackTfUrlObject.searchParams.append('craftable', craftable)
    }

    tag.href = backpackTfUrlObject.toString()
    span.innerText = price.value

    tag.append(image, span)

    return tag
  }

  const tagContainer = document.createElement('div')
  tagContainer.classList.add(priceContainerClassName)

  const tags = qualAndPricesArray
    .flatMap(({ quality, pricings }) => {
      const tags = []

      // unique and strange only
      if (!['6', '11'].includes(quality)) {
        return tags
      }

      if (pricings['Craftable']) {
        tags.push(
          makeTags({
            itemName,
            quality: qualities.find((qual) => qual.id == quality),
            craftable: true,
            price: pricings['Craftable'][0],
          })
        )
      }
      if (pricings['Non-Craftable']) {
        tags.push(
          makeTags({
            itemName,
            quality: qualities.find((qual) => qual.id == quality),
            craftable: false,
            price: pricings['Non-Craftable'][0],
          })
        )
      }
      return tags
    })
    .filter((tag) => tag)
  tags.forEach((tag) => {
    tagContainer.appendChild(tag)
  })
  return tagContainer
}

function addPricingTags() {
  if (!ready) {
    return
  }
  document.querySelectorAll(`${target}`).forEach((itemManager) => {
    if (itemManager.querySelector(`.${priceContainerClassName}`)) {
      return
    }
    const itNameMaybeWithParen = itemManager.getAttribute('title')
    if (!itNameMaybeWithParen) {
      return
    }
    const itName = itNameMaybeWithParen.split(' (')[0]

    const itPrices = itemPrices.get(itName)

    if (!itPrices) {
      return
    }
    itemManager.append(getPricesElement(itName, itPrices))
  })
}

while (true) {
  let confirmation = window.prompt(
    'Using Priced loadout.tf requires your backpack.tf API Key, for more information visit https://en.wikipedia.org/wiki/API_key, Enter "okay" to open backpack.tf API dashboard.'
  )
  if (confirmation === 'okay') {
    break
  }
}
window.open('https://backpack.tf/developer/apikey/view')

API_KEY = window.prompt(
  "Insert API key, if your browser didn't pop up, go to https://backpack.tf/developer/apikey/view"
)

const onScrollAttacher = setInterval(() => {
  let itemsContainer = document.querySelector('.item-manager-items-inner')
  if (!itemsContainer) {
    return
  }
  clearInterval(onScrollAttacher)
  itemsContainer.addEventListener('scroll', addPricingTags)
  setReady()
  fillPrice(itemPrices)
}, 1000)
