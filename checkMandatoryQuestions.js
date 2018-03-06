window.onload = function(){
	var submitButton = document.querySelector('#submit')
	console.debug('dkjfqmd', submitButton)
	submitButton.addEventListener('click', checkMandatoryQuestions)
}

function checkMandatoryQuestions() {
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

	console.log('unanswered', unanswered)
}