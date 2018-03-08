window.onload = function(){
	var submitButton = document.querySelector('#submit')
	console.debug('dkjfqmd', submitButton)
	submitButton.addEventListener('click', checkMandatoryQuestions)
}

function checkMandatoryQuestions() {
	clearHighlightedQuestions()
	responses = document.querySelectorAll('*[data-mandatory = "true"]')
	var unanswered = [];
	Array.prototype.forEach.call(responses, function(response) {
		var responseContent;
		switch(response.tagName) {
			case 'INPUT':
				responseContent = response.value
				if (responseContent === '' || responseContent === ' ') {
					unanswered.push(response)
				}
				break
			case 'FORM':
				if (response.children[0].className === 'ui-radio') {
					responseContent = Array.prototype.filter.call(response.querySelectorAll('INPUT'), function(child) {
						return child.checked
					})
					if (!responseContent.length) {
						unanswered.push(response)
					}
				} else if (response.children[0].className === 'ui-select') {
					responseContent = Array.prototype.filter.call(response.querySelector('SELECT'), function(option) {
						return option.selected
					})[0].value
					if (responseContent === 'undefined') {
						unanswered.push(response)
					}
				}
				break
			case 'DIV':
				responseContent = djRate.generated()[0].rate
				if (typeof responseContent === 'undefined') {
					unanswered.push(response)
				}
				break
		}
	})

	unanswered[0].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
	document.querySelector('#pageFrontBanner p').innerHTML = 'Club Finder - Sombre!! vous n\'avez pas repondu à toutes les questions'
	document.querySelector('#pageFrontBanner').style.backgroundColor = '#f4b942'
	unanswered.forEach(function(item){
		(function(element){
			var parentEl = element.parentElement
			if (parentEl.className.indexOf('question') !== -1) {
				highlightQuestion(parentEl)
			} else {
				arguments.callee(parentEl)
			}
		})(item)

	})
}

function highlightQuestion (question) {
	question.style.boxShadow = '5px 1px 4px 1px #f4b942';
	question.style.margin = '1em 0 1em 0'
}

function clearHighlightedQuestions () {
	Array.prototype.forEach.call(document.querySelectorAll('.question'), function(question){
		question.style.boxShadow = 'none'
		question.style.margin = 0
	})
	document.querySelector('#pageFrontBanner p').innerHTML = 'Club Finder - Night Club Form'
	document.querySelector('#pageFrontBanner').style.backgroundColor = '#7fd648'
}