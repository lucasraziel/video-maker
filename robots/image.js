const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')	
const imgUrlBlackList = require('../content/blackList.json').imageUrlBlackList

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot(){
	const content = state.load()

	await fetchImagesofAllSentences(content)

	await downloadAllImages(content)

	state.save(content)



	async function fetchImagesofAllSentences(content){
		for (const sentence of content.sentences){
			const query = `${content.searchTerm} ${sentence.keywords[0]}`
			sentence.images = await fetchGoogleAndReturnImagesLinks(query)
			sentence.googleSearchQuery = query
		}
	}


	async function fetchGoogleAndReturnImagesLinks(query){
		const response = await customSearch.cse.list({
			auth: googleSearchCredentials.apikey,
			cx: googleSearchCredentials.searchEngineId,
			q: query,
			searchType: 'image',
			num: 6
		})

		const imagesUrl = response.data.items.map((item)=>{
			return item.link
		})

		return imagesUrl
	}

	async function downloadAllImages(content){
		content.downloadedImages= []

		for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
			const images = content.sentences[sentenceIndex].images

			for (let imageIndex = 0; imageIndex < images.length; imageIndex++){
				const imageUrl = images[imageIndex]

				try{
					if (content.downloadedImages.includes(imageUrl)){
						throw new Error('Imagem já foi baixada')
					}

					if (imgUrlBlackList.includes(imageUrl)){
						throw new Error('Imagem em black list')
					}
					await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
					content.downloadedImages.push(imageUrl)
					console.log(`>[${sentenceIndex}] [${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
					break
				}catch (error){
					console.log(`>[${sentenceIndex}] [${imageIndex}] Erro ao baixar imagem (${imageUrl}): ${error}`)
				}
			}
		}
	}

	async function downloadAndSave(url, fileName){
		return imageDownloader.image({
			url: url,
			dest: `./content/${fileName}`
		})
	}
	

}

module.exports = robot