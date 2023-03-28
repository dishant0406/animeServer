import axios from 'axios'
import malScraper from 'mal-scraper'
import { ANIME, StreamingServers } from '@consumet/extensions';
const gogo = new ANIME.Gogoanime()

const Query = {
  topAnime: async (_, args) => {
    const page = args.page || 0
    const d = await gogo.fetchTopAiring(page)
    return d.results
  },
  animeSearch: async (parent, args) => {
    const page = args.page || 0
    const d = await gogo.search(args.id, page)
    return d.results
  },
  animeDetails: async (parent, args) => {
    const data = await gogo.fetchAnimeInfo(args.id)
    const d = await malScraper.getInfoFromName(data.id)
    data.image = data.image || d.picture
    data.trailer = d.trailer
    return data
  },
  streamLinkDetails: async (parent, args) => {
    const data = await gogo.fetchEpisodeSources(args.id)

    return data.sources.map((source) => {
      return ({
        id: `${args.id}-${source.quality}`,
        url: source.url,
        quality: source.quality,
        isM3U8: source.isM3U8,
        episodeId: args.id,
      })
    });
  },
  recentEpisodes: async (parent, args) => {


    const page = args.page || 0
    const d = await gogo.fetchRecentEpisodes(page)


    const dataToSend = d.results.map((recent) => ({
      animeId: recent.id,
      episodeId: recent.episodeId,
      episodeNumber: recent.episodeNumber,
      animeTitle: recent.title,
      image: recent.image,
      animeUrl: recent.url,
    }))

    return {
      results: dataToSend,
      hasNextPage: d.hasNextPage
    }
  }

}

const Recent = {
  anime: async (parent, args) => {
    const data = await gogo.fetchAnimeInfo(parent.animeId)
    const d = await malScraper.getInfoFromName(data.id)
    data.image = data.image || d.picture
    data.trailer = d.trailer
    return data
  },
  streamLinks: async (parent, args) => {
    const data = await gogo.fetchEpisodeSources(parent.episodeId)
    return data.sources.map((source) => ({
      id: `${parent.episodeId}-${source.quality}`,
      url: source.url,
      quality: source.quality,
      isM3U8: source.isM3U8,
      episodeId: parent.episodeId,
    }));
  }

}

const Anime = {
  animeDetails: async (parent, args) => {
    const data = await gogo.fetchAnimeInfo(parent.id)
    const d = await malScraper.getInfoFromName(data.id)
    data.image = data.image || d.picture
    data.trailer = d.trailer
    return data
  }
}

const Episode = {
  streamLinks: async (parent, args) => {
    const data = await gogo.fetchEpisodeSources(parent.id)
    return data.sources.map((source) => ({
      id: `${parent.id}-${source.quality}`,
      url: source.url,
      quality: source.quality,
      isM3U8: source.isM3U8,
      episodeId: parent.id,
    }));
  }
}

export default {
  Query,
  Anime,
  Episode,
  Recent
}