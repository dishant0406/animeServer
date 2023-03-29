import axios from 'axios'
import malScraper from 'mal-scraper'

const URL = `http://localhost:3000`

const Query = {
  topAnime: async (_, args) => {
    const page = args.page || 0
    const res = await axios.get(URL + `/top-airing/?page=${page}`)
    res.data = res.data.map((anime) => {
      anime.id = anime.animeId
      anime.title = anime.animeTitle
      anime.imgUrl = anime.animeImg
      delete anime.animeId
      delete anime.animeTitle
      delete anime.animeImg
      return anime
    })
    const promises = res.data.map(async (anime) => {
      const d = await malScraper.getInfoFromName(anime.id)
      anime.imgUrl = anime.imgUrl || d.picture
      anime.trailer = d.trailer
      return anime
    })

    res.data = await Promise.all(promises)
    return res.data
  },
  animeSearch: async (parent, args) => {
    const page = args.page || 1
    let query = args.id
    if (query.includes(' ')) {
      query = query.split(' ').join('+')
    }
    const res = await axios.get(URL + `/search?keyw=${query}&page=${page}`)
    res.data = res.data.map((anime) => {
      anime.id = anime.anime_id
      anime.title = anime.name
      anime.imgUrl = anime.img_url
      delete anime.animeId
      delete anime.name
      delete anime.img_url
      return anime
    }
    )
    return res.data

  },
  animeDetails: async (parent, args) => {
    const data = await axios.get(URL + `/getAnime/${args.id}`)
    const d = await malScraper.getInfoFromName(args.id)
    data.data.image = data.data.image || d.picture
    data.data.trailer = d.trailer
    data.data.id = args.id
    return data.data
  },
  streamLinkDetails: async (parent, args) => {
    const data = await axios.get(URL + `/getEpisode/${args.id}`)
    console.log(data.data)
    data.data.hls = data.data.gogoSourcesHLS?.[0]?.file || data.data.gogoSourcesBackupHLS?.[0]?.file
    data.data.id = args.id
    return data.data
  },
  recentEpisodes: async (parent, args) => {
    const page = args.page || 0
    const res = await axios.get(URL + `/recent-release/?page=${page}`)
    return res.data
  }

}



export default {
  Query,
}