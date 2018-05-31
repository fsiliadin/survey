window.onload = function(){
	var submitButton = document.querySelector('#submit')
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

	if (unanswered.length) {
		unanswered[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
		document.querySelector('#pageFrontBanner p').innerHTML = 'Club Finder - Il manque quelques petites réponses'
		document.querySelector('#pageFrontBanner').style.backgroundColor = '#f4b942'
		unanswered.forEach(function(item) {
			(function(element){
				var parentEl = element.parentElement
				if (parentEl.className.indexOf('question') !== -1) {
					highlightQuestion(parentEl)
				} else {
					arguments.callee(parentEl)
				}
			})(item)

		})
	} else {
		createDataObject()
	}
	
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
	document.querySelector('#pageFrontBanner p').innerHTML = 'Club Finder - Formulaire'
	document.querySelector('#pageFrontBanner').style.backgroundColor = '#7fd648'
}

function createDataObject () {
	var clubData = {}
	clubData.name = document.querySelector('#clubNameInput').value
	clubData.atmospheres = [];
	clubData.atmospheres.push(document.querySelector('#atmosphereSelect select').value)
	clubData.atmospheres.concat(document.querySelector('#clubOtherAtmosphereInput').value.split(' '))
	clubData.districts = document.querySelector('#clubDistrictInput').value.split()
	clubData.freeAdmission = document.querySelector('#entreeGratuite').checked
	clubData.admissionPrice = document.querySelector('#clubAdmissionPriceInput').value
	clubData.specialTariffs = document.querySelector('#tarifParticulier').value
	clubData.offeredDrink = document.querySelector('#consoOfferte').checked
	clubData.detailedDrinkPrices = {
		hard: document.querySelector('#hardDrinkPrice').value,
		shots: document.querySelector('#shotPrice').value,
		pinte: document.querySelector('#beerPrice').value
	}
	clubData.cloakroom = {
		price: document.querySelector('#cloackRoomPrice').value
	}
	clubData.frequenting = document.querySelector('#frequentationInput').value.split(',')
	clubData.dressCode = document.querySelector('#dressCodeInput').value.split(',')
	clubData.averageAge = document.querySelector('#averageAgeInput').value
	clubData.visitDay = document.querySelector('#visiteDay select').value
	clubData.density = Array.prototype.filter.call(document.querySelectorAll('#densityRadio input'), function(option) {
		return option.checked
	})[0].value
	clubData.femalePercentage = femalePercentage.generated()[0].value
	clubData.specificities = document.querySelector('#clubSpecificities').value + (document.querySelector('#terrace').checked ? ' terrasse' : '')
	clubData.shortDescription = document.querySelector('#description').value
	clubData.djRate = djRate.generated()[0].rate
	clubData.responseOn = new Date()

	console.log('club Data', JSON.stringify(clubData))

	var req = new XMLHttpRequest();

    req.onreadystatechange = function(event) {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        	window.setTimeout(function(){
        		document.querySelector('#pageFrontBanner').style.backgroundColor = 'black'
        		document.querySelector('#submit').style.backgroundColor = 'black'
        		window.setTimeout(function(){
	        		document.querySelector('#pageFrontBanner').style.backgroundColor = '#7fd648'
        			document.querySelector('#submit').style.backgroundColor = '#7fd648'
        			document.querySelector('#pageFrontBanner p').innerHTML = 'Club Finder - Nous avons bien reçu vos données, merci :)'  
	        	}, 1000)
        	}, 1000)            
        }
    };
    req.open('POST', 'https://clubfinderform.pw', true);
    req.send(JSON.stringify(clubData));
}