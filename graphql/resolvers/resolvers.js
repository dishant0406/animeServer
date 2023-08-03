import axios from 'axios'
import malScraper from 'mal-scraper'

const URL = `https://anime.konflix.xyz`

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
      anime.id = anime.animeId
      anime.title = anime.animeTitle
      anime.imgUrl = anime.animeImg
      delete anime.animeId
      delete anime.name
      delete anime.img_url
      return anime
    }
    )
    return res.data

  },
  animeDetails: async (parent, args) => {
    const data = await axios.get(URL + `/anime-details/${args.id}`)
    const d = await malScraper.getInfoFromName(args.id)
    data.data.imageUrl = data.data.animeImg || d.picture
    data.data.trailer = d.trailer
    data.data.name = data.data.animeTitle
    data.data.released = data.data.releasedDate
    data.data.episode_id = data.data.episodesList.map((epi) => {
      return {
        episodeId: epi.episodeId,
        episodeNumber: epi.episodeNum,
      }
    }).reverse()

    data.data.id = args.id
    return data.data
  },
  streamLinkDetails: async (parent, args) => {
    const dataReturn = await Promise.all([
      axios.get(URL + `/streamsb/watch/${args.id}`),
      axios.get(URL + `/vidcdn/watch/${args.id}`),
      axios.get(`https://api.consumet.org/anime/gogoanime/servers/${args.id}`)
    ])
    const d = await malScraper.getInfoFromName(args.id)
    const data = {
      data: {}
    }

    data.data.streamsb = dataReturn?.[2]?.data?.[0]?.url
    data.data.xstreamcdn = dataReturn?.[2]?.data?.[1]?.url

    data.data.animeNameWithEP = d.title + ' Episode ' + args.id?.split('episode-')?.[1]
    data.data.anime_info = d.synopsis
    data.data.ep_num = args.id?.split('episode-')?.[1]

    data.data.hls = dataReturn?.[0]?.data?.sources?.[0]?.file || dataReturn?.[1]?.data?.sources?.[0]?.file
    data.data.id = args.id
    return data.data
  },
  recentEpisodes: async (parent, args) => {
    const page = args.page || 0
    const res = await axios.get(URL + `/recent-release/?page=${page}`)
    res.data = res.data.map((anime) => {
      return {
        ...anime,
        name: anime.animeTitle,
        imgUrl: anime.animeImg,
      }
    })

    return res.data
  },
  recommandedAnime: async (parent, args) => {
    const res = await axios.get(URL + `/genre/${args.genre}`)
    return res.data
  }

}



export default {
  Query,
}