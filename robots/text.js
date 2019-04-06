const algorithmia = require('algorithmia')
const algorithmiaApikey = require('../credentials/algorithmia.json').apikey

async function robot(content){
	await fetchContentFromWikipedia(content)
	sanitizeContent(content)
	//breakContentIntoSentences(content)

	
	async function fetchContentFromWikipedia(content){
		const algorithmiaAutenticated = algorithmia(algorithmiaApikey)
		const wikipediaAlgorithm = algorithmiaAutenticated.algo("web/WikipediaParser/0.1.2")
		const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
		const wikipediaContent = wikipediaResponse.get()
		
		content.sourceContentOriginal = wikipediaContent.content


		
	}

	function sanitizeContent(content){
		const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
		const withoutDatesinParentheses = removeDatesinParentheses(withoutBlankLinesAndMarkdown)
		
		content.sourceContentSanitized = withoutDatesinParentheses
		
		function removeBlankLinesAndMarkdown(text){
			const allLines = text.split('\n')


			const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
				if (line.trim().length === 0 || line.trim().startsWith('=')){
					return false
				}

				return true
			})

			return withoutBlankLinesAndMarkdown.join(' ')
		}

		function removeDatesinParentheses(text){
			return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
		}

		
	}
}

module.exports = robot