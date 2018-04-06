    // focus, the root object that all basic component inherit
    // it defines generic methods 
    var focus = {
        // event referential array that lists events and their element
        eventsArray: [],
        // focus widget's relevant data are kept and updated in this array
        elDataArray: [],
        // DOM element that are being dragged/dropped
        dragDropEl: [],

        /**
        * Records data of any generated widget in elDataArray
        * @param {Object} elData - the data of the generated widget
        * @param {Array} res - an array of data of each generated widget with the same constructor call
        * @return {Array} - elData pushed into res 
        */
        recordElData: function (elData, res) {
            res.push(elData);
            focus.elDataArray.push(elData);
            return res;
        },

        /**
        * Retrieves a focus generated element by its hash
        * @param {String} hash - the hash of the seeked element
        * @return {Object} - elData of the element corresponding to the hash
        */
        findElementByHash: function (hash) {
            return focus.elDataArray.filter(function (elData) {
                return elData.hash == hash;
            })[0];
        },

        /**
        * Updates a widget revelant data (useful in case of multiple insertion of same element)
        * @param {DOMelement} el - the widget element to update
        */
        updateElData: function (el) {
            var dataToUpdate = focus.findElementByHash(el.dataset.hash)
            if(dataToUpdate) {
                dataToUpdate.element = el;
                dataToUpdate.container = el.parentElement;
                if ('gridItems' in dataToUpdate) {
                    dataToUpdate.gridItems = el.children;
                }
                if('navButtons' in dataToUpdate) {
                    dataToUpdate.navButtons = el.children;
                }
                if ('subSliders' in dataToUpdate) {
                    var subSliders = dataToUpdate.element.querySelectorAll('.subSlideZone');
                    dataToUpdate.subSliders.forEach(function(subSlider, index){
                        subSlider.element = subSliders[index];
                    });
                }
                if ('selectedItems' in dataToUpdate) {
                    dataToUpdate.selectedItems = Array.prototype.filter.call(dataToUpdate.gridItems, function(gridItem) {
                        return focus.hasClass(gridItem, 'selected')
                    })
                }
            }
            
        },

        /**
        * The only function that inserts html into the DOM
        * @param {String} htmlStr - the html string to be inserted
        * @param {DOMElment} parentEl - the element in which the new html will be generated
        * @param {Number} positionInNodeList - the position the html will be insert at
        * @return {DOMElement} - the generated element
        */
        generate : function generate(htmlStr, parentEl, positionInNodeList) {
            var siblings = parentEl.children;
            // if the programmer doesn't specify any position by default the position is the last
            if (typeof positionInNodeList === 'undefined' || positionInNodeList > siblings.length - 1) {
                if (siblings.length) { // if parentEl has children
                    siblings[siblings.length - 1].insertAdjacentHTML("afterend", htmlStr);
                } else {
                    parentEl.innerHTML += htmlStr;
                }
                // if the generated element "existed" before this function call (reinsertion) we rebind
                // its events on it after reinsertion
                this.rebindEvents(parentEl.children[siblings.length - 1]);
                return parentEl.children[siblings.length - 1];
            } else {
                siblings[positionInNodeList].insertAdjacentHTML("beforebegin", htmlStr);
                this.rebindEvents(parentEl.children[positionInNodeList]);
                return parentEl.children[positionInNodeList];
            }
        },

        /** 
        * Generates a unique hash
        * @return {Number} a random number
        */
        generateHash: function generateHash(){
            return (Math.pow(2,32)*Math.random()+1)/(1000*Math.random()+1)*Math.exp(10*Math.random()+1);
        },

        /**
        * Delegates events to the body
        * @param {DOMElement} el - the element to bind the event to
        * @param {Array} events - array of objects describing the events:
        *   type: a string representing the type of event
        *   handler: the event's callback
        */
        delegateEvent: function delegateEvent(el, events) {
            events.forEach(function(event){
                focus.bindEvent(document.querySelector('body'), [{
                    type: event.type,
                    handler: function(e) {
                        if (e.target.dataset.hash===el+'') {
                            event.handler(e);
                        }
                    }
                }]);
            });
            // events.forEach(function(event){
            //     focus.bindEvent(document.querySelector("[data-hash='"+el+"']"), event);
            // });
        },

        /**
        * Unlike delegateEvent this function attaches event directly to an element
        * @param {DOMElement} el - the element to bind the event to
        * @param {Array} event - array of events to be attached:
        *   type: a string representing the type of event
        *   handler: the event's callback
        */
        bindEvent: function bindEvent(el, events) {
            events.forEach(function(event) {
                focus.eventsArray.push({
                    hash: el.dataset.hash,
                    event: event
                });
                if (!(event.type instanceof Array)) {
                    el.addEventListener(event.type, event.handler, event.capture);
                } else {
                    event.type.forEach(function(eventType){
                        el.addEventListener(eventType, event.handler, event.capture)
                    })
                }
            });
        },

        /**
        * Rebinds the undelegates events of an element on element
        * it's useful is case of multiple reinsertion of the "same" element in the DOM
        * @param {DOMElement} el - the element to rebind events to        *
        */
        rebindEvents: function rebindEvents(el) {
            focus.updateElData(el);
            focus.eventsArray.filter(function (event) {
                return event.hash && (event.hash == el.dataset.hash);
            }).forEach(function(event) {

                el.addEventListener(event.event.type, event.event.handler);
            });
            if (el.children.length) {
                Array.prototype.forEach.call(el.children, function(child) {
                    focus.rebindEvents(child);
                })
            }
        },

        /**
        * Gets the elements corresponding to a selector if it exist, else throw an error
        * @param {String} parentSelector - the selector of the element(s)
        * @return {NodeList} - the selected element(s)
        */
        checkParent: function checkParent(parentSelector) {
            try {
                if (parentSelector == false) {
                    parentEl = document.querySelectorAll('body');
                } else {
                    parentEl = document.querySelectorAll(parentSelector);
                }
                return parentEl;
            } catch (error) {
                console.error (error.message);
            }
        },

        render: function render(){

        },

        hasClass: function hasClass(element, _class) {
            return Array.prototype.indexOf.call(element.classList, _class) > -1;
        },

        removeClass: function removeClass (element, _class) {
            element.className = element.className.replace(_class, '');
            // we return focus so that we can chain function call
            return this;
        },

        addClass: function addClass (element, _class) {
            // _class could be an array of classes
            element.className += ' '+_class.toString();
        },
        removeUnity: function removeUnity (str) {
            var strArr = str.split('');
            strArr.splice(strArr.length - 2, 2);
            return strArr.join('') | 0;
        },

        // this function returns the position of an element relative to the specified area
        // the element shall exist in that area
        getPositionInArea: function getPositionInArea(el, area) {
            var pos = {
                top : 0,
                left : 0
            }
            function getPosition(el){
                pos.top += el.offsetTop;
                pos.left += el.offsetLeft;
                if(el.offsetParent !== area){
                     getPosition(el.offsetParent);
                }
                return pos;
            }
            return getPosition(el);
        }

    } //focus

    function Banner(parentSelector, obj, positionInNodeList){
        var parentEl = this.checkParent(parentSelector);
        this.generate = function (container, descriptor) {
            var html = '';
            var classes = ''; 
            // if the element to be create has an id so we only create one in the first matchin component
            if(typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            var self = this;
            Array.prototype.forEach.call(container, function(item, index){
                descriptor.class.indexOf('basic_banner') === -1 ? descriptor.class.push('basic_banner'): '';
                classes = descriptor.class.join(' ');
                self.hash = focus.generateHash();
                html =  '<div><div class = "shadow-top" style = "height:4px"></div><div id="'+descriptor.id+'" class ="'+classes+'" data-hash="'+self.hash+'""></div><div class = "shadow-bottom" style = "height:15px"></div>';

                self.__proto__.generate(html, item, positionInNodeList);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(self.hash, descriptor.events);
                }

            });
        }       
        this.generate(parentEl, obj);
    }



    function Accordion (parentSelector, obj, positionInNodeList){
        var parentEl = this.checkParent(parentSelector);
        this.generate = function (container, descriptor) {
            var html = '';
            var classes = '';
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            var self = this;

            Array.prototype.forEach.call(container, function(item, index){
                descriptor.class.indexOf('basic_accordion') === -1 ? descriptor.class.push('basic_accordion'):'';
                classes = descriptor.class.join(' ');
                self.hash = focus.generateHash();
                html = '<table class = "'+classes+'" data-hash="'+self.hash+'" id ="'+descriptor.id+'"style = "height:'+descriptor.height+'"><tr>';
                for (var i = 0; i < descriptor.nbCols; i++) {
                    if (i === descriptor.nbCols - 1) {
                        i = 'Last';
                    }
                    html += '<td class ="accordionItem" data-hash='+focus.generateHash()+'><div class="accordionPlaceholder" data-hash='+focus.generateHash()+'>'+descriptor.placeholderUnactive+'</div><div class= "accordionContent" data-hash='+focus.generateHash()+'>'+descriptor.activeContent+'</div></td>';
                }
                html += '</tr></table>';
                self.__proto__.generate(html, item, positionInNodeList);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(self.hash, descriptor.events);
                }
            });
        }

        this.generate(parentEl, obj);
    }

  

    /**
    * Generates one or several ImageTextZone(s).
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the ImageTextZone(s)
    * @param {Object} obj - the ImageTextZone descriptor:
    *   class: an array of classes to be added to each ImageTextZone
    *   id: the id of the ImageTextZone, if specified the ImageTextZone will be generated only in the first container
    *   events: an array of the event object to bind on the ImageTextZone:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *       imageAfter: boolean, true if you want the image to be displayed after the text
    *       imageWidth: the width of the image as valid css between quotes,
    *       imageHeight: 'the height of the image as valid css between quotes',
    *       url: the url of the image,
    *       alt: image alt,
    *       text: the text
    * @param {Number} positionInNodeList - the position of the ImageTextZone between its siblings
    */
    function ImageTextZone(parentSelector, obj, positionInNodeList){
        var parentEl = this.checkParent(parentSelector);
        /**
        * Generates ImageTextZone html and inserts it in the proper container in the DOM
        * @param {NodeList} container - contains element ImageTextZone will be generated in. (one button per element)
        * @param {Object} descriptor - the ImageTextZone descriptor
        *
        * @return {Array} an array of ImageTextZone data:
        *   hash: the hash of the generated ImageTextZone
        *   element: the ImageTextZone element as it is in the DOM   
        *   container: the parent element of each generated ImageTextZone
        *   image: the image of the ImageTextZone
        *   text: the text of the imageTextZone
        */
        this.generate = function (container, descriptor) {
            var html = '';
            var classes = '';
            var res = [], ret;
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            var self = this;
            Array.prototype.forEach.call(container, function(item, index){
                descriptor.class.indexOf('basic_imageTextZone') === -1 ? descriptor.class.push('basic_imageTextZone'):'';
                classes = descriptor.class.join(' ');
                var hash = focus.generateHash();
                html = '<table class= "'+classes+'" data-hash="'+hash+'" id ="'+descriptor.id+'"><tr>';
                if(descriptor.imageAfter) {
                    html += '<td class ="text" data-hash='+focus.generateHash()+' ><p>'+descriptor.text+'</p></td>';
                    html += '<td class ="image" data-hash='+focus.generateHash()+' ><img class ="bli" data-hash='+focus.generateHash()+' src="'+descriptor.url+'" alt= "'+descriptor.alt+'" style ="width:'+descriptor.imageWidth+'; height:'+descriptor.imageHeight+';"></td>';
                } else {
                    html += '<td class ="image" data-hash='+focus.generateHash()+' ><img class ="bli" data-hash='+focus.generateHash()+' src="'+descriptor.url+'" alt= "'+descriptor.alt+'" style ="width:'+descriptor.imageWidth+'; height:'+descriptor.imageHeight+';"></td>';
                    html += '<td class ="text" data-hash='+focus.generateHash()+' ><p>'+descriptor.text+'</p></td>';
                }
                html += '</tr></table>';
                ret = self.__proto__.generate(html, item, positionInNodeList);
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    image: descriptor.url,
                    text: descriptor.text
                };
                res = focus.recordElData(elData, res);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }
            });
            return res;
        }
        var generated = this.generate(parentEl, obj);
        /**
        *   Gets the ImageTextZone updated data
        */
        this.generated = function () {
            var toReturn = [];
            generated.forEach(function(generatedEl){
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            //generatedEl is just for debug, don't base anything on it
            self.generatedEl = toReturn;
            return toReturn;
        };
    }

    /**
    * Generates one or several Slider(s).
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the Slider(s)
    * @param {Object} obj - the Slider descriptor:
    *   class: an array of classes to be added to each Slider
    *   id: the id of the Slider, if specified the Slider will be generated only in the first container
    *   events: an array of the event object to bind on the Slider:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *   label: the Slider title
    *   value: initial value of the Slider
    *   min: Slider's min value
    *   max: Slider's max value
    *   subSliders: an array of Slider subzones
    *       label: label of the subzone
    *       color: color of the subzone
    *       value: initial value of the subzone
    * @param {Number} positionInNodeList - the position of the Slider between its siblings
    */
    function Slider (parentSelector, obj, positionInNodeList) {
        var parentEl = this.checkParent(parentSelector);
        this.generate = function (container, descriptor) {
            var html = '';
            var classes = '';
            var res = [], ret;
            // if the programmer specifies an id, only the first node el is taken in account
            // can't have several object with the same id
            if(typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            if( !(descriptor.subSliders instanceof Array)){
                descriptor.subSliders = []
            }
            var self = this;
            // for each node el taken in account is generated an html
            Array.prototype.forEach.call(container, function(item, index){
                descriptor.class.indexOf('basic_slider') === -1 ? descriptor.class.push('basic_slider') : '';
                classes = descriptor.class.join(' ');
                // creation of a hash to identify each element
                var hash = focus.generateHash();
                html = '<div id="'+descriptor.id+'" class=' + classes + ' data-hash="'+hash+'" data-index='+ index +' ><span class="sliderTitleLabel" data-hash="'+focus.generateHash()+'">'+(descriptor.label ? descriptor.label+':' : '')+' <span class="sliderValue" data-hash = "'+focus.generateHash()+'">'+descriptor.value+'</span></span><div class="sliderCore" data-hash='+focus.generateHash()+'>';
                html += '<span class="minValue" data-hash='+ focus.generateHash() +' >'+ descriptor.min + '</span>';
                html += '<div class ="sliderMechanics" data-hash='+ focus.generateHash() +'>';
                html += '<div class ="sliderAxis" data-hash='+ focus.generateHash() +'></div>';
                html += '<div class ="dynamicItemsContainer" data-hash='+ focus.generateHash() +'>';
                html += '<div class ="mainSlideZone" data-hash='+ focus.generateHash() +'>';
                for (var i = 0; i < descriptor.subSliders.length; i++) {
                    html += '<div class="subSlideZone" data-hash='+ focus.generateHash() +'  data-index='+i+'>'+ descriptor.subSliders[i].label +'</div>';
                    if (i !== descriptor.subSliders.length - 1) {
                        html += '<div class="subCursor" data-hash='+ focus.generateHash() +' data-index='+i+'></div>';  
                    }             
                }
                html += '</div>'; // mainSlideZone end
                html += '<div class ="mainCursor" data-hash='+ focus.generateHash() +'></div>';
                html += '</div>'; // dynamicItemsContainer end
                html += '</div>'; // sliderMechanics end 
                html += '<span class="maxValue" data-hash='+ focus.generateHash() +' >'+ descriptor.max + '</span>';
                html += '</div>'; // coreSlider end
                html += '</div>'; // slider end
                ret = self.__proto__.generate(html, item, positionInNodeList);
                var subSliders = ret.querySelectorAll('.subSlideZone');
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    value: descriptor.value,
                    min: descriptor.min,
                    max: descriptor.max,
                    subSliders: descriptor.subSliders.map(function(subSlider, index){
                        return {
                            element: subSliders[index],
                            value: descriptor.subSliders[index].value
                        }
                    })
                };
                res = focus.recordElData(elData, res);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }

                                    
                Array.prototype.forEach.call(ret.querySelectorAll('.mainCursor, .subCursor'), function(cursor){
                    focus.bindEvent(cursor, [{
                        type: ['touchstart', 'mousedown'],
                        handler: function (e) {
                            focus.dragDropEl.push(e.target);
                        }
                    }]);
                });
                focus.bindEvent(ret, [{
                    type: ['touchend', 'mouseup'],
                    handler: function () {
                        focus.dragDropEl.length = 0;
                    }
                 }, {
                    type: ['touchmove', 'mousemove'],
                    handler: (function(ret) {
                            return function (e) {
                                var movementX;    
                                if (!('movementX' in e)) {
                                    movementX = e.changedTouches[0].clientX - focus.getPositionInArea(e.target, document.querySelector('BODY')).left;
                                } else {
                                    movementX = e.movementX;
                                }
                                var slider = self.generated()[ret.dataset.index];                                    
                                if (focus.dragDropEl.length && focus.hasClass(focus.dragDropEl[0], 'mainCursor')) { 
                                    var cursorPos = focus.dragDropEl[0].offsetLeft + movementX;
                                    var sliderAxisWidth = (slider.element.querySelector('.sliderAxis').offsetWidth - 12);
                                    if (cursorPos <= sliderAxisWidth && cursorPos >= 0){
                                        focus.dragDropEl[0].style.left = cursorPos + 'px';
                                    }                                     
                                    slider.element.querySelector('.mainSlideZone').style.width = focus.dragDropEl[0].style.left;
                                    var slider = self.generated()[slider.element.dataset.index];
                                    slider.value = cursorPos * (slider.max - slider.min) / sliderAxisWidth + slider.min;
                                    slider.value = slider.value/Math.abs(slider.value) * Math.floor(Math.abs(slider.value));
                                    slider.value = slider.value > slider.max ? slider.max : slider.value;
                                    slider.value = slider.value < slider.min ? slider.min : slider.value;
                                    var valueSpan = slider.element.querySelector('.sliderValue');
                                    if (valueSpan.innerHTML !== slider.value+'') {
                                        valueSpan.innerHTML = slider.value;
                                    }
                                    Array.prototype.forEach.call(slider.element.querySelectorAll('.subCursor'), function (subCursor, index, list) {
                                       subCursor.style.left = ((parseInt(subCursor.dataset.index) + 1) * (focus.dragDropEl[0].offsetLeft/(list.length+1)) - 10) + 'px';
                                       Array.prototype.forEach.call(slider.element.querySelectorAll('.subSlideZone'), function(subZone, index){
                                            subZone.style.width = focus.dragDropEl[0].offsetLeft/(list.length+1) +'px';
                                            slider.subSliders[index].value = Math.trunc((slider.value - slider.min)/slider.subSliders.length);
                                        });
                                    });
                                } else if (focus.dragDropEl.length) {
                                    cursorPos = slider.element.querySelector('.mainSlideZone').offsetWidth;
                                    focus.dragDropEl[0].style.left = (focus.dragDropEl[0].offsetLeft + movementX) +'px';
                                    var subCursors = slider.element.querySelectorAll('.subCursor');  
                                    var leftZone = slider.element.querySelector('.subSlideZone[data-index="'+focus.dragDropEl[0].dataset.index+'"]');
                                    var rightZone = slider.element.querySelector('.subSlideZone[data-index="'+((focus.dragDropEl[0].dataset.index | 0) +1)+'"]');
                                    leftZone.style.width =  (leftZone.offsetWidth + movementX) +'px';
                                    rightZone.style.width =  (rightZone.offsetWidth - movementX) +'px';
                                    
                                    var adjustementValue = 0;
                                    var unVoidZones = Array.prototype.filter.call(slider.element.querySelectorAll('.subSlideZone'), function(subZone) {
                                        if (subZone.offsetWidth === 0) {
                                            var inc = (subZone.dataset.index == 0 || subZone.dataset.index == subCursors.length) ? 1 : 2;
                                            adjustementValue += inc * subCursors[0].offsetWidth / 2;
                                            if(subZone.dataset.virtualWidth > 0) {
                                                adjustementValue += subZone.dataset.virtualWidth;
                                            }
                                            subZone.dataset.virtualWidth = -1;
                                        }
                                        return subZone.offsetWidth > 0;
                                    });

                                    Array.prototype.forEach.call(unVoidZones, function(unVoidZone) {
                                        var inc = (unVoidZone.dataset.index == 0 || unVoidZone.dataset.index == subCursors.length) ? 1 : 2;
                                        unVoidZone.dataset.virtualWidth = unVoidZone.offsetWidth + inc * subCursors[0].offsetWidth / 2 + adjustementValue / unVoidZones.length;
                                    });
                                    Array.prototype.forEach.call(slider.element.querySelectorAll('.subSlideZone'), function(subZone) {
                                        subZone.dataset.virtualWidth = subZone.dataset.virtualWidth < 0 ? 0 : subZone.dataset.virtualWidth;
                                        slider.subSliders[subZone.dataset.index].value = Math.round(subZone.dataset.virtualWidth * (slider.value - slider.min) / cursorPos);
                                    });
                                    console.log(slider);
                                }
                            }
                    })(ret)
                }, {
                    type: 'mouseleave',
                    handler: function(){
                        focus.dragDropEl.length = 0;
                    }
                }]);
                focus.bindEvent(ret.querySelector('.dynamicItemsContainer'), [{
                    type: 'click',
                    handler: (function (ret) {
                            return function(e) {
                            console.log('eeeee', e);
                            var slider = self.generated()[ret.dataset.index];
                            // important, we query the cursor in the target because we don't want to perform actions below on click on mainSlideZone
                            // since mainSlideZone is before dynamicItemsContainer, we get cursor only if we click at the right of mainCursor 
                            // in others words the click can only set the slider value bigger
                            var cursor = e.target.querySelector('.mainCursor');
                            if(cursor) {
                                console.log('OOFFFSET LEFT', cursor.offsetLeft)
                                var cursorPos = e.offsetX;
                                var sliderAxisWidth = (slider.element.querySelector('.sliderAxis').offsetWidth - 12);
                                if (cursorPos <= sliderAxisWidth && cursorPos >= 0){
                                  cursor.style.left = cursorPos + 'px';
                                } 
                                slider.value = cursor.offsetLeft * (slider.max - slider.min) / sliderAxisWidth + slider.min;
                                slider.value = slider.value/Math.abs(slider.value) * Math.floor(Math.abs(slider.value));
                                slider.value = slider.value > slider.max ? slider.max : slider.value;
                                slider.value = slider.value < slider.min ? slider.min : slider.value;
                                var valueSpan = slider.element.querySelector('.sliderValue');
                                if (valueSpan.innerHTML !== slider.value+'') {
                                    valueSpan.innerHTML = slider.value;
                                }
                                slider.element.querySelector('.mainSlideZone').style.width = cursor.style.left;
                                Array.prototype.forEach.call(slider.element.querySelectorAll('.subCursor'), function (subCursor, index, list) {
                                   subCursor.style.left = (((subCursor.dataset.index|0) + 1) * (cursor.offsetLeft/(list.length+1)) - 10) + 'px';
                                   Array.prototype.forEach.call(slider.element.querySelectorAll('.subSlideZone'), function(subZone, index){
                                        subZone.style.width = cursor.offsetLeft/(list.length+1) +'px';
                                        slider.subSliders[index].value = Math.trunc((slider.value - slider.min)/slider.subSliders.length);
                                    });
                                });
                                console.log('CLFDF', slider)
                            }
                        }
                    })(ret)
                }]);


            });
            return res;
        }
        var generated = this.generate(parentEl, obj);

        this.setValue = function (value, slider) {
            if (slider) {
                slider.value = value;
                var sliderAxisWidth = (slider.element.querySelector('.sliderAxis').offsetWidth - 12);
                mainCursorPos = (value - slider.min) * sliderAxisWidth / (slider.max - slider.min);  
                slider.element.querySelector('.mainCursor').style.left = mainCursorPos + 'px';
                console.log('mainCursorPos', mainCursorPos);
                var customEvent = new Event("click", {"bubbles":true, "cancelable":false, "offsetX": mainCursorPos});
                slider.element.querySelector('.dynamicItemsContainer').dispatchEvent(customEvent);
            } else {
                var self = this;
                this.generated().forEach(function (slider) {
                    self.setValue(value, slider);
                })
            }
        }
        /**
        *   Gets the Slider updated data
        */
        this.generated = function () {
            var toReturn = [];
            generated.forEach(function(generatedEl){
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            //generatedEl is just for debug, don't base anything on it
            self.generatedEl = toReturn;
            return toReturn;
        };

        console.log('generated', this.generated());

    }

    function Footer(parentSelector, obj, positionInNodeList){
        var parentEl = this.checkParent(parentSelector);

    }

    function Menu(parentSelector, obj, positionInNodeList){
        //can be selectMenu too
        var parentEl = this.checkParent(parentSelector);

    }

    function Popup(parentSelector, obj) {
        var parentEl = this.checkParent(parentSelector);
    }

     /**
    * Generates one or several Button(s).
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the button(s)
    * @param {Object} obj - the Button descriptor:
    *   class: an array of classes to be added to each Button
    *   id: the id of the Button, if specified the Button will be generated only in the first container
    *   events: an array of the event object to bind on the button:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *   text: the text on the button
    * @param {Number} positionInNodeList - the position of the button between its siblings
    */
    function Button(parentSelector, obj, positionInNodeList){
        /**
        * Generates button html and inserts it in the proper container in the DOM
        * @param {NodeList} container - contains element buttons will be generated in. (one button per element)
        * @param {Object} descriptor - the button descriptor
        *
        * @return {Array} an array of button data:
        *   hash: the hash of the generated button
        *   element: the button element as it is in the DOM   
        *   container: the parent element of each generated button
        *   changeText: a method that changes the text of a specific button
        */
        var parentEl = this.checkParent(parentSelector);
        var self = this;

        this.generate = function (container, descriptor) {
            var html= '';
            var classes= '';
            var res = [], ret;
            // if the programmer specifies an id, only the first node el is taken in account
            // can't have several object with the same id
            if(typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            var self = this;
            // for each node el taken in account is generated an html
            Array.prototype.forEach.call(container, function(item, index){
                descriptor.class.indexOf('basic_button') === -1 ? descriptor.class.push('basic_button'): '';
                classes = descriptor.class.join(' ');
                // creation of a hash to identify each element
                var hash = focus.generateHash();
                html = '<div id="'+descriptor.id+'" class ="'+classes+'" data-hash="'+hash+'">'+descriptor.text+'</div>';
                ret = self.__proto__.generate(html, item, positionInNodeList);
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    changeText: function (text) {
                        this.element.innerHTML = text;
                    }
                };
                res = focus.recordElData(elData, res);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }
            });
            return res;
        };
        
        /**
        * Changes the text of all generated Button
        * @param {string} text - the new text
        */
        this.changeText = function (text) {
            self.generated().forEach(function (button) {
                button.changeText(text);
            });
        };


        var generated = this.generate(parentEl, obj);
        /**
        *   Gets the Button updated data
        */
        this.generated = function () {
            /*  variable "generated" is captured from above, but the elements it contains can be obsolete (does not reflect the actual DOM element)
                since those elements refers to the elements generated on this.generate() call. So we base on the hash to retrieve the actual DOM element in
                elDataArray which elements are kept up to date on every widget modification in the DOM 
            */
            var toReturn = [];
            generated.forEach(function(generatedEl){
                // searches the generated widget referential array and returns the one corresponding to the specified hash
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            // /!\generatedEl is just for debug, don't base anything on it /!\
            self.generatedEl = toReturn;
            return toReturn;
        };
    }

    /**
    * Generates one or several Scroller(s). A scroller is a widget that scrolles to specified targets on click
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the scroller(s)
    * @param {Object} obj - the scroller descriptor:
    *   class: an array of classes to be added to each scroller
    *   id: the id of the scroller, if specified the scroller will be generated only in the first container
    *   events: an array of the event object to bind on the scroller:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *   targets: an array of selectors, targets will be any element matching the selectors in the container
    */
    function Scroller (parentSelector, obj) {
        var positionInNodeList = 0;
        var parentEl = this.checkParent(parentSelector);
        var self = this;
        /**
        * Generates scroller html and inserts it in the proper container in the DOM
        * @param {NodeList} container - contains element(s) scroller will be generated in, one scroller per element
        * @param {Object} descriptor - the scroller descriptor
        * @return {Array} an array of scroller data:
        *   hash: the hash of the generated scroller
        *   element: the scroller element as it is in the DOM
        *   targets: an array of selectors   
        *   container: the parent element the generated scroller
        *   addTarget: a method that adds target to the scroller
        *   removeTarget: a method that removes target from the scroller
        */
        this.generate = function (container, descriptor) {
            var html = '';
            var classes = '';
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            var res = [], ret;
            Array.prototype.forEach.call(container, function (item, index) {
                descriptor.class.indexOf('basic_scroller') === -1 ? descriptor.class.push('basic_scroller'):'';
                descriptor.class.indexOf('goingDown') === -1 ? descriptor.class.push('goingDown'):'';
                classes = descriptor.class.join(' ');
                var hash = focus.generateHash();
                html = '<img id="' + descriptor.id + '" src="images/scroller_arrow_down.png" alt="scroller_arrow" data-index='+index+' class="'+classes+'" data-hash="'+hash+'">';
                ret = self.__proto__.generate(html, item, positionInNodeList);
                if(typeof descriptor.events !== 'undefined'){
                    self.__proto__.delegateEvent(hash, descriptor.events);
                }
                ret.style.top = (item.tagName === 'BODY' ? document.documentElement.clientHeight : focus.removeUnity(item.style.height)) - 50 + 'px';              
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    targets: descriptor.targets.slice(),
                    addTarget: function (selector) {
                        if(this.targets.indexOf(selector) === -1) {
                            this.targets.push(selector);
                        }
                    },
                    removeTarget: function (selector) {
                        var index= this.targets.indexOf(selector);
                        if (index !== -1) {
                            this.targets.splice(index, 1);                            
                        }
                    }
                };
                res = focus.recordElData(elData, res);
            });
            return res;
        };
        /**
        * Scrolles the scroll area to the next target
        * @param {DOMelement} area - the scroll area
        * @param {Object} scrollDistances - the distance to scroll
        *   top: the distance to scroll on vertical axis as a Number
        *   left: the distance to scroll on horizontal axis as a Number
        */
        this.smoothScrollBy = function smoothScrollBy (area, scrollDistances) {
            var animation;
            //  saves the position we've just scrolled to
            var previousScrollPos = {
                top: area.scrollTop,
                left: area.scrollLeft
            };
            //  position to reach
            var finalPositions = {
                top: area.scrollTop + scrollDistances.top,
                left: area.scrollLeft + scrollDistances.left
            }
            //  stores the increment to scroll, gets small as we are near to the target
            var increment = {
                top: 0,
                left: 0
            };
            //  the distance we have browsed
            var browsed = {
                top:0,
                left:0
            };
            animation = setInterval(function(){
                // increment calculation
                increment.top = (scrollDistances.top - browsed.top) * 0.3;                
                increment.left = (scrollDistances.left - area.scrollLeft) * 0.3;

                // we can't scroll by a value inf to 1 and sup to -1
                area.scrollTop += Math.abs(increment.top) < 1 ? Math.abs(increment.top)/increment.top  : increment.top;
                area.scrollLeft += Math.abs(increment.left) < 1 ? Math.abs(increment.left)/increment.left  : increment.left;
                browsed.top += increment.top;
                browsed.left += increment.left;

                // if we reach the target or if we can't reach it because of the length of the page
                // we stop scrolling
                if (((scrollDistances.top >= 0 && area.scrollTop >= finalPositions.top) 
                    || (scrollDistances.top <= 0 && area.scrollTop <= finalPositions.top)) 
                    && ((scrollDistances.left >= 0 && area.scrollLeft >= finalPositions.left)
                    || (scrollDistances.left <= 0 && area.scrollLeft <= finalPositions.left))
                    || (scrollDistances.top === 0 && previousScrollPos.left === area.scrollLeft
                    || scrollDistances.left === 0 && previousScrollPos.top === area.scrollTop
                    || scrollDistances.top !== 0 && scrollDistances.left !== 0
                    && previousScrollPos.left === area.scrollLeft && previousScrollPos.top === area.scrollTop)) {
                    clearInterval(animation);
                }
                previousScrollPos.top = area.scrollTop;
                previousScrollPos.left = area.scrollLeft;
            },100)
        }
        /**
        * Gets the DOM elements corresponding to the targets in scrollArea and calculates their top position
        * relative to the scrollArea scrollTop.
        * @param {Number} scrollerId - the id of the scroller.
        * @param {Boolean} relative - if true, the position are calculated relative to the scrollArea scrollposition,
        *   the positions are absolute in the scrollArea
        * @return {Array} - a sorted array of the positions of the targets
        */
        this.getTargets = function getTargets (scrollerId, relative) {
                var targetsInScrollArea, targetEls= [];
                var scrollerObj = self.generated()[scrollerId];
                var scrollArea = scrollerObj.container;
                scrollerObj.targets.forEach(function(targetSelector){
                    // we get the matching target elements in the scroll area 
                    targetsInScrollArea = scrollArea.querySelectorAll(targetSelector);
                    // then we gather them in the same array
                    targetEls = targetEls.concat(Array.prototype.slice.call(targetsInScrollArea));                  
                });
                var offset = relative ? scrollArea.scrollTop : 0;
                return targetEls.map(function (target){
                    return focus.getPositionInArea(target, scrollArea).top - offset
                }).sort(function(a, b){
                    return a - b;
                });
        };

        /**
        * Adds target to all generated scrollers
        * @param {string} selector - the selector of the target  
        */
        this.addTarget = function addTarget (selector) {
            this.generated().forEach(function (scrollerObj) {
                scrollerObj.addTarget(selector);
            });
        };

        /**
        * removes target from all generated scrollers
        * @param {string} selector - the selector of the target  
        */
        this.removeTarget = function removeTarget (selector) {
            this.generated().forEach(function (scrollerObj) {
                scrollerObj.removeTarget(selector);
            })
        };
      
        if (!(obj.events instanceof Array)){
            obj.events = [];
        }
        // Push a default click event in the events array
        obj.events.push({
            type: 'click',
            handler: 
            // On click we scroll to the nearest target according the direction of the scroller 
            function(e) {
                var distanceToNextTarget = 0;
                // we determine the area to browse according the scroller that is clicked
                var scrollArea = e.target.parentElement;
                // then we get the position of the targets relative to the scrollArea scroll position
                var targetRelativePosition = self.getTargets(e.target.dataset.index, true).filter(function(target){
                    // whether we are moving down or moving up we look to the target above or under the current scroll position
                    if(focus.hasClass(e.target, 'goingUp')){
                        return target < 0; 
                    } else {
                        return target > 0;
                    }
                });
                // if there is no targets to go, we return
                if (targetRelativePosition.length === 0) {return;}

                distanceToNextTarget = targetRelativePosition[0] < 0 ? targetRelativePosition.pop() : targetRelativePosition.shift();
                // scroll the scrollArea
                self.smoothScrollBy(scrollArea, {
                    top: distanceToNextTarget,
                    left: 0
                });
            }
        });

       

        var previousScrollPos= {
            top:0,
            left:0
        } 
        // here we update the scroller element on scroll of window
        window.onscroll = function(){
            var scroller = document.querySelector('body .basic_scroller');
            var targets = self.getTargets(scroller.dataset.index);
            var highest = targets[0];
            var lowest = targets[targets.length - 1];

            if (this.scrollY > previousScrollPos.top ) {
                focus.hasClass(scroller, 'goingDown') ? '' : focus.removeClass(scroller, 'goingUp').addClass(scroller, 'goingDown'); 
            } else if (this.scrollY < previousScrollPos.top ) {
                focus.hasClass(scroller, 'goingUp') ? '' : focus.removeClass(scroller, 'goingDown').addClass(scroller, 'goingUp'); 
            }
            if (this.scrollY <= highest || this.scrollY === 0) {
                focus.hasClass(scroller, 'goingDown') ? '' : focus.removeClass(scroller, 'goingUp').addClass(scroller, 'goingDown'); 
            }
            if (document.documentElement.scrollHeight === this.scrollY + document.documentElement.clientHeight || this.scrollY >= lowest){
                focus.hasClass(scroller, 'goingUp') ? '' : focus.removeClass(scroller, 'goingDown').addClass(scroller, 'goingUp'); 
            }
            // simulating position fixed
            scroller.style.top = focus.removeUnity(scroller.style.top) + (this.scrollY - previousScrollPos.top) + 'px';
            previousScrollPos.top = this.scrollY;
        }        

        var generated = this.generate(parentEl, obj);
        /**
        *   Gets the Scroller updated data
        */
        this.generated = function () {
            /*  variable "generated" is captured from above, but the elements it contains can be obsolete (does not reflect the actual DOM element)
                since those elements refers to the elements generated on this.generate() call. So we base on the hash to retrieve the actual DOM element in
                elDataArray which elements are kept up to date on every widget modification in the DOM 
            */
            var toReturn = [];
            generated.forEach(function(generatedEl){
                // searches the generated widget referential array and returns the one corresponding to the specified hash
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });            
            // /!\generatedEl is just for debug, don't base anything on it /!\
            self.generatedEl = toReturn;
            return toReturn;
        };
        // here we update the scroller element on scroll of any other element than window
        Array.prototype.forEach.call(self.generated(), function(scrollObj, index) {
            var previousScrollPos = {top:0}, scroller, highest, lowest, targets;
            var scrollArea = scrollObj.container;
            focus.bindEvent(scrollArea, [{
                type: 'scroll',
                handler: function () {
                    scroller = scrollObj.element;
                    targets = self.getTargets(index);
                    highest = targets[0];
                    lowest = targets[targets.length - 1];
                    if (this.scrollTop > previousScrollPos.top) {
                        focus.hasClass(scroller, 'goingDown') ? '' : focus.removeClass(scroller, 'goingUp').addClass(scroller, 'goingDown'); 
                    } else if (this.scrollTop < previousScrollPos.top) {
                        focus.hasClass(scroller, 'goingUp') ? '' : focus.removeClass(scroller, 'goingDown').addClass(scroller, 'goingUp'); 
                    }
                    if (this.scrollTop <= highest || this.scrollTop === 0) {
                        focus.hasClass(scroller, 'goingDown') ? '' : focus.removeClass(scroller, 'goingUp').addClass(scroller, 'goingDown'); 
                    }
                    if (this.scrollHeight === this.scrollTop + this.clientHeight || this.scrollTop >= lowest){
                        focus.hasClass(scroller, 'goingUp') ? '' : focus.removeClass(scroller, 'goingDown').addClass(scroller, 'goingUp'); 
                    }
                    // simulating position fixed
                    scroller.style.top =   focus.removeUnity(this.style.height) - 50 + this.scrollTop + 'px';
                    previousScrollPos.top = this.scrollTop;
                }
            }]);
        });
    }

    /**
    * Generates one or several RateSliders
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the slider(s)
    * @param {Object} obj - the slider descriptor:
    *   class: an array of classes to be added to each RateSlider
    *   id: the id of the rateslider, if specified the rateslider will be generated only in the first container
    *   events: an array of the event object to bind on the rateslider:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *   maxRate: the maximum rate on the rateslider, as a number
    *   initialValue: initial value of the rateslider, as a number
    *   readOnly: if we don't want ui to set rateslider value, readOnly should be set true. Default value is false
    *   pattern: the pattern of the rateslider (star, dollars...) can be passed as a string or as an unicode utf-8 value. default value is: &#9733
    *   activeColor: the color of the active items. Default value is : rgb(255, 221, 153) 
    * @param {Number} positionInNodeList - the position of the slider between its siblings
    */
    function RateSlider (parentSelector, obj, positionInNodeList) {
        var parentEl = this.checkParent(parentSelector);
        var self = this;
        if (!(obj.events instanceof Array)){
            obj.events = [];
        }
        obj.events.push({
            type: 'mouseout',
            handler: 
            function (e) {
                self.fill(self.generated()[e.target.dataset.index].rate, e.target.children);
            }
        });

        /**
        * Generates rateslider html and inserts it in the proper container in the DOM
        * @param {NodeList} container - contains element(s) rateslider will be generated in, one rateslider per element
        * @param {Object} descriptor - the rateslider descriptor
        * @return {Array} an array of rateslider data:
        *   hash: the hash of the generated rateslider
        *   element: the rateslider element as it is in the DOM
        *   rate: the value of the rateslider as a number   
        *   container: the parent element the generated rateslider
        */
        this.generate = function (container, descriptor) {
            var html = '';
            var classes = '';
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            var res = [];
            Array.prototype.forEach.call(container, function (item, index) {
                descriptor.class.indexOf('basic_rateSlider') === -1 ? descriptor.class.push('basic_rateSlider'):'';
                classes = descriptor.class.join(' ');
                var hash = focus.generateHash();
                html = '<div id="' + descriptor.id + '" class="' + classes + '" data-hash=' + hash + ' data-index=' + index + '>';
                for (var i = 1; i <= descriptor.maxRate; i++) {
                    html += '<div class="rateItem" data-hash='+focus.generateHash()+'  data-rate=' + i + '>' + (descriptor.pattern || "&#9733") + '</div>'
                }
                html += '</div>';
                var ret = self.__proto__.generate(html, item, positionInNodeList);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }
                self.fill(descriptor.initialValue, ret.children);
                if (!descriptor.readOnly) {
                    Array.prototype.forEach.call(ret.children, function (rateItem, id) {
                        focus.bindEvent(rateItem, [{
                            type: 'mouseenter',
                            handler: function (e) {
                                self.fill(e.target.dataset.rate, self.generated()[index].element.children);
                            }
                        }, {
                            type: 'click',
                            handler: function (e) {
                                self.generated()[index].rate = e.target.dataset.rate; 
                            }
                        }]);
                    });
                }
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    rate: descriptor.initialValue
                };
                res = focus.recordElData(elData, res);
            });
            return res;
        }

        /**
        * Set the value of the specified rateslider
        * @param {Number} rate - the value to set
        * @param {Object} rateSlider - a rateSlider data object as it is returned by this.generated()
        *                              if there is no rateSlider specified every element of this.generated will be set
        */
        this.setValue =  function (rate, rateSlider) {
            if (rateSlider) {
                rateSlider.rate = rate;
                this.fill(rate, rateSlider.element.children);
            } else {
                var self = this;
                this.generated().forEach(function (rateSlider) {
                    self.setValue(rate, rateSlider);
                })
            }
        }

        /**
        *   Colores the rateSlider according its rate
        *   @param {Number} rate - the rate of the rateSlider
        *   @param {NodeList} siblings - the rateSlider's rateItems
        */
        this.fill = function (rate, siblings) {
            for (var i=1; i<= rate; i++) {
                siblings[i - 1].style.color = obj.activeColor || "rgb(255, 221, 153)";
            }
            for(i; i<= obj.maxRate; i++) {
                siblings[i - 1].style.color = "rgb(190, 190, 190)"
            }
        }

        var generated = this.generate(parentEl, obj);

        /**
        *   Gets the Rateslider updated data
        */
        this.generated = function () {
            /*  variable "generated" is captured from above, but the elements it contains can be obsolete (does not reflect the actual DOM element)
                since those elements refers to the elements generated on this.generate() call. So we base on the hash to retrieve the actual DOM element in
                elDataArray which elements are kept up to date on every widget modification in the DOM 
            */
            var toReturn = [];
            generated.forEach(function(generatedEl){
                // searches the generated widget referential array and returns the one corresponding to the specified hash
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            // /!\generatedEl is just for debug, don't base anything on it /!\
            self.generatedEl = toReturn;
            return toReturn;
        };
    }

    /**
    * Generates one or several Grid(s)
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the grid(s)
    * @param {Object} obj - the grid descriptor:
    *   class: an array of classes to be added to each Grid (add 'listAlikeGrid' class to make grid behave like a list)
    *   id: the id of the grid, if specified the grid will be generated only in the first container
    *   events: an array of the event object to bind on the grid:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *   itemWidth: the width of grid items, if not specified item will wrap its content
    *   itemHeight: the height of the grid items, if not specifies but itemWidth is specified itemHeight = itemWidth
    *   nbItems: the number of items in the grid
    *   checkable: 'multiple'/'single'/<default> either the grid can behave like a radiobutton or not. Multiple means several item can be clicked
    *   contents: An array of content object that grid items will be generated from. contents.length replaces nbItems:
    *       content: an html string or any focus generated widget
    *       width: the width of grid item the content will be insert in, if not specified item will wrap its content
    *       height: the height of the grid item the content will be insert in, if not specifies but width is specified height = width
    * @param {Number} positionInNodeList - the position of the grid between its siblings
    */
    function Grid(parentSelector, obj, positionInNodeList){
        var parentEl = this.checkParent(parentSelector);
        var self = this;
        /**
        * Generates grid html and insert it in the proper container in the DOM
        * @param {NodeList} container - contains element grids will be generated in. (one grid per element)
        * @param {Object} descriptor - the grid descriptor
        * @return {Array} an array of grid data:
        *   hash: the hash of the generated grid
        *   element: the grid element as it is in the DOM
        *   gridItems: a NodeList of the grid items   
        *   container: the parent element of each generated grid
        *   selectedItems: the selected items of the grid
        */
        this.generate = function (container, descriptor) {
            var html = '';
            var classes  = '';
            var res = [], ret;
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            Array.prototype.forEach.call(container, function (item, index){
                if(descriptor.class.indexOf('listAlikeGrid') === -1) {
                    descriptor.class.indexOf('basic_grid') === -1 ? descriptor.class.push('basic_grid'):'';
                } else {
                    descriptor.class.push('listAlikeGrid');
                }
                classes = descriptor.class.join(' ');
                var hash = focus.generateHash();
                var L = descriptor.itemWidth;
                var l = descriptor.itemHeight ? descriptor.itemHeight : L;
                html = '<div id ="'+descriptor.id+'" class="'+classes+'" data-hash="'+hash+'" data-index="'+index+'">'
                if (!('contents' in descriptor)) {
                    for (var i = 0; i < descriptor.nbItems; i++) {
                        html += self.buildItem({
                            width: descriptor.itemWidth, 
                            height: descriptor.itemHeight
                        }, i, hash);
                    }
                } else {
                    descriptor.contents.forEach(function (content, index) {
                        html += self.buildItem(content, index, hash);
                    })
                }
                
                html += '</div>';
                ret = self.__proto__.generate(html, item, positionInNodeList);
                Array.prototype.forEach.call(ret.children, function (child){
                    self.addGridItemMethods(child);
                    if(descriptor.checkable) {
                        focus.bindEvent(child, [{
                            type: 'click',
                            handler: function(event){
                                var currentGrid = self.generated()[index];
                                if(!focus.hasClass(child, 'selected')) {
                                    focus.addClass(child, 'selected');
                                    if (descriptor.checkable ==='single') {
                                        currentGrid.selectedItems.forEach(function(selectedItem) {
                                            focus.removeClass(selectedItem, 'selected');
                                        });
                                        currentGrid.selectedItems.length = 0;
                                    }
                                    currentGrid.selectedItems.push(child);
                                } else {
                                    focus.removeClass(child, 'selected');
                                    currentGrid.selectedItems.splice(currentGrid.selectedItems.indexOf(child), 1);
                                }
                            }
                        }])
                    }
                    
                });
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    gridItems: ret.children,
                    checkable: descriptor.checkable,
                    selectedItems: []
                };
                res = focus.recordElData(elData, res);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }
            });
            return res;
        }

        /**
        * Attaches "default" methods to grid items
        * @param {DOM Element} - the grid item element
        * @return {DOM Element} - the grid item element extended with the methods
        */
        this.addGridItemMethods = function (gridItem) {
            var self = this;
            gridItem.addContent = function(obj) {
                var content;
                if(typeof obj.content === 'object') {
                    content = obj.content.generated()[0].element.outerHTML;
                    obj.content.generated()[0].element.remove();
                } else {
                    content = '<span data-hash= ' + focus.generateHash() + '>' + obj.content + '</span>';
                }
                self.__proto__.generate(content, this, obj.positionInNodeList);
            };
            gridItem.clearContent = function() {
                this.innerHTML = '';
            };
            gridItem.modify = function(dimensions) {
                this.style.height = dimensions.height;
                this.style.width =  dimensions.width;
            };
            gridItem.select = function select() {
                focus.removeClass(this, 'selected')
                focus.addClass(this, 'selected')
                focus.findElementByHash(this.dataset.gridofbelonging).selectedItems.push(this)
                console.log(focus.findElementByHash(this.dataset.gridofbelonging).selectedItems)

            }
            gridItem.unselect = function unselect() {                
                focus.removeClass(this, 'selected')
            }
            return gridItem;
        }
        /**
        * Adds specified item to the grid
        * @param {Object} - params 
        *   to: the grid to add the item to, since the Grid constructor generates a grid per parent, there could be several grid generated.
        *       Therefore we should specify the one we want to add the item to,
        *       otherwise the item will be added to every generated grid
        *   content: the content of the gridItem, can be passed as html string or as any focus-generated element
        *   events: an array of the event object to bind on the gridItem:
        *   type: a string representing the type of event
        *   handler: the callback of the event
        *   positionInNodeList: the position of the item withing the other items in the grid
        * @return {Array} - an array of the newly generated items
        */
        this.addItem = function (params) {
            var itemHtml; 
            var self = this;
            var addedItems = [];
            if(!(params.events instanceof Array)) {
                params.events = []
            }  
            if (params.to) {
                itemHtml = this.buildItem(params, params.positionInNodeList, params.to.element.dataset.hash);
                addedItems.push(this.addGridItemMethods(this.__proto__.generate(itemHtml, params.to.element, params.positionInNodeList)));
            } else {
               this.generated().forEach(function (grid) {
                    itemHtml = self.buildItem(params, params.positionInNodeList, grid.element.dataset.hash);
                    addedItems.push(self.addGridItemMethods(self.__proto__.generate(itemHtml, grid.element, params.positionInNodeList)));
               });
            }
            if(this.generated()[0].checkable){
                addedItems.forEach(function(addedItem){
                    params.events.push({
                        type: 'click',
                        handler: function(event){
                            var currentGrid = focus.findElementByHash(this.dataset.gridofbelonging)
                            if(!focus.hasClass(addedItem, 'selected')) {
                                focus.addClass(addedItem, 'selected');
                                if (currentGrid.checkable ==='single') {
                                    currentGrid.selectedItems.forEach(function(selectedItem) {
                                        focus.removeClass(selectedItem, 'selected');
                                    });
                                    currentGrid.selectedItems.length = 0;
                                }
                                currentGrid.selectedItems.push(addedItem);
                            } else {
                                focus.removeClass(addedItem, 'selected');
                                currentGrid.selectedItems.splice(currentGrid.selectedItems.indexOf(addedItem), 1);
                            }
                        }
                    })
                    focus.bindEvent(addedItem, params.events);                
                })
            }
            
            return addedItems;
        }

        /**
        * populates a grid with an array of contents
        * @param {Object} - params
        *   grid:   the grid to populate, since the Grid constructor generates a grid per parent, there could be several grid generated.
        *           Therefore we should specify the one we want to populate,
        *           otherwise every generated grid will be populated
        *   contents: an array of content, each content is an object with a property 'content' that can be passed as html string or as any focus-generated element
        *             while the 'positionInNodeList' poperty defines the position of the content within the item children
        */
        this.populate = function (params) {
            if (params.grid) {
                try {
                    Array.prototype.forEach.call(params.grid.gridItems, function (gridItem, index) {
                        if (index === params.contents.length) {
                            throw ''
                        } 
                        gridItem.addContent(params.contents[index]);
                    });
                } catch(e){
                    e !== '' ? console.error('ERROR: ', e) : ''
                }
                
            } else {
                this.generated().forEach(function (grid) {
                    try {
                        Array.prototype.forEach.call(grid.gridItems, function (gridItem, index) {
                            if (index === params.contents.length) {
                                throw ''
                            } 
                            gridItem.addContent(params.contents[index]);
                        });
                    } catch(e){
                        e !== '' ? console.error('ERROR: ', e) : ''
                    } 
                });
            }
        }
        /**
        * Removes specified item from the grid
        * @param {Object} - params 
        *   from: the grid to remove the item from, since the Grid constructor generates a grid per parent, there could be several grid generated.
        *       Therefore we should specify the one we want to remove the item from,
        *       otherwise the item will be removed from every generated grid
        *
        *   positionInNodeList: the position of the item to remove withing the other items in the grid
        */
        this.removeItem = function (params) {
            var toRemove;
            var self = this;
            if (params.from) {
                params.from.element.children[params.positionInNodeList].remove();
            } else {
                this.generated().forEach(function(grid) {
                    grid.element.children[params.positionInNodeList].remove();
                });
            }
            // this.updateGridItemIndexes()
        }
        /**
        * builds the html of a grid item
        * @param {Object} gridItemObj  
        *   width: the width of the item (passed as css value), if not specified the grid item will wrap its content
        *   height: the height of the item (passed as css value), if not specified whereas width is specified the height will be equal to the width
        *           otherwise the grid item will wrap its content
        *   content: the content of the gridItem, can be passed as html string or as any focus-generated element
        * @param {Number} index - the position of the gridItem within its siblings
        * @param {String} gridOfBelonging - the hash of the grid the gridItem belongs to
        * @return {String} - the item to be generated html
        */
        this.buildItem = function (gridItemObj, index, gridOfBelonging) {
            var content;
            if(typeof gridItemObj.content === 'object') {
                content = gridItemObj.content.generated()[0].element.outerHTML;
                gridItemObj.content.generated()[0].element.remove();
            } else {
                content = gridItemObj.content;
            }
            return '<div class= "gridItem" id =' + gridItemObj.id + ' data-index= ' + index + ' data-hash=' + focus.generateHash() + ' data-gridOfBelonging=' + gridOfBelonging + ' style= "width:' + gridItemObj.width + '; height:' + (gridItemObj.height || gridItemObj.width)+'";">'+(content||"")+'</div>';
        }
        var generated = this.generate(parentEl, obj);
        /**
        *   Gets the Grid updated data
        */
        this.generated = function () {
            var toReturn = [];
            generated.forEach(function(generatedEl){
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            //generatedEl is just for debug, don't base anything on it
            self.generatedEl = toReturn;
            return toReturn;
        };

        /**
        *   updates gridItems indexes
        */
        this.updateGridItemIndexes = function () {
            this.generated().forEach(function (generatedGrid) {
                Array.prototype.forEach.call(generatedGrid.gridItems, function(gridItem, index) {
                    gridItem.dataset.index = index
                })
            })
        }
    }

    /**
    * WordMatch objects need to be attached to a text input, and should be passed an array of words
    * It matches the strings inputed with the strings in the array
    * @constructor
    * @param {DOMElement} textInput - the text input to listen to
    * @param {Array} wordsArray - the string array to search
    *
    */
    function WordMatch(textInput, wordsArray) {
        this.wordsArray = wordsArray;
        this.textInput = textInput;
        this.sortedWords = [];
        // on keypress, we calculate the match rate of the inputed string with every string in the wordsArray
        this.customEvent = new CustomEvent('matchingComplete');
        focus.bindEvent(this.textInput, [{
            type: 'keydown',
            handler:  function (event) {
                if(event.key === 'Backspace') {
                    setTimeout(function() {
                        if(!event.target.value.length) {
                            this.sortedWords = this.wordsArray;
                        } else {
                            var inputValue = event.target.value;
                            this.sortedWords = this.getMatchingWords(inputValue);                      
                        }
                        this.textInput.dispatchEvent(this.customEvent);  
                    }.bind(this), 500)
                } 
                setTimeout(function(){                
                    var inputValue = event.target.value ;
                    this.sortedWords = this.getMatchingWords(inputValue);
                    this.textInput.dispatchEvent(this.customEvent);
                }.bind(this), 500);
            }.bind(this)
        }]);

        /**
        * Gets the words that match the inputed one
        * @param {String} wordToMatch - the inputed word
        * @return {Array} - A sorted array of the words matching the most the inputed one
        */
        this.getMatchingWords = function getMatchingWords(wordToMatch) {
            var limen = 0
            switch(wordToMatch.length) {
                case 1: limen = 0; break;
                case 2: limen = 0.50; break;
                case 3: limen = 0.75; break;
                case 4: limen = 0.85; break;
                case 5: limen = 0.90; break;
                case 6: limen = 0.95; break;
                default: limen = 0.99; break;
            }
            return this.wordsArray.map(function(word) {
                return {
                    word: word,
                    rate: this.matchRate(word, wordToMatch)
                }
            }.bind(this)).sort(function (a, b){
                return b.rate - a.rate;
            }).filter(function(wordObj){
                return wordObj.rate > limen;
            }).map(function (wordObj){
                return wordObj.word;
            })
        }

        /**
        * Calculates the matching rate between two words
        * @param {String} ref - the reference word
        * @param {String} word - the inputed word
        * @return {Number} - a match percentage between the two words
        */
        this.matchRate = function matchRate(ref, word) {
            //  we do consider that if word is a substring of ref then there is a match
            if (ref.toUpperCase().indexOf(word.toUpperCase()) !== -1) {
                return 1;
            }
            var rate = 0;
            var refRate = 0;
            for (var i = ref.length -1; i >= 0 ; i--) {
                refRate += Math.pow(2, i);
            }
            for (i = 0; i < word.length; i++) {
                if (i < ref.length) {
                    rate += (ref.charAt(i).toUpperCase() === word.charAt(i).toUpperCase()) * Math.pow(2, ref.length - 1 - i);
                } else {
                    rate -= Math.pow(2, i - ref.length)
                }
            }
            return rate/refRate;
        }
    }

    /**
    * Generates one or several LabelList(s)
    * @constructor
    * @param {String} parentSelector - the selector that will determine the container(s) of the LabelList(s)
    * @param {Object} obj - the LabelList descriptor:
    *   class: an array of classes to be added to each LableList 
    *   id: the id of the LableList, if specified the LableList will be generated only in the first container
    *   events: an array of the event object to bind on the LableList:
    *       type: a string representing the type of event
    *       handler: the callback of the event
    *   title: the title of the LabelList, optional
    *   color: the color (ass a valid css color value) to set on the labels of the LabelList
    * @param {Number} positionInNodeList - the position of the LableList between its siblings
    */
    function LabelList(parentSelector, obj, positionInNodeList) {
        var parentEl = this.checkParent(parentSelector);
        var self = this;

        /**
        * Generates LabelList html and inserts it in the proper container in the DOM
        * @param {NodeList} container - contains element LabelLists will be generated in. (one LabelList per element)
        * @param {Object} descriptor - the LabelList descriptor
        * @return {Array} an array of LabelList data:
        *   hash: the hash of the generated LabelList
        *   element: the LabelList element as it is in the DOM
        *   color: the color of the labels
        *   container: the parent element of each generated LabelList
        *   labels: the labels of the LabelList as an array
        */
        this.generate = function (container, descriptor) {
            var html = '';
            var classes  = '';
            var res = [], ret;
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            Array.prototype.forEach.call(container, function (item, index){
                descriptor.class.indexOf('basic_labelList') === -1 ? descriptor.class.push('basic_labelList'):'';
                classes = descriptor.class.join(' ');
                var hash = focus.generateHash();
                html += '<div class ="'+classes+'" data-hash= '+hash+' id = '+(descriptor.id||"")+'>';
                if(descriptor.title) {
                    html += '<span class= "title">'+descriptor.title+': </span>'
                }

                descriptor.labels.forEach(function (label) {
                    html += '<span class= "label" data-hash='+ focus.generateHash()+ ' style="background-color:'+descriptor.backgroundColor+'; color:'+descriptor.color+'!important">' + label + '</span>';
                });
                html += '</div>';
                ret = self.__proto__.generate(html, item, positionInNodeList);
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    labels: descriptor.labels,
                    colors: {
                        backgroundColor: descriptor.color,
                        color: descriptor.color
                    }
                };
                res = focus.recordElData(elData, res);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }
            });
            return res;
        }
        /**
        * adds specified label to the LabelList
        * @param {String} label - the label to add
        * @param {DOMElement} labelList - the LabelList to add the label to, since the LabelList constructor generates a LabelList per parent, there could be several LabelList generated.
        *       Therefore we should specify the one we want to add the label to,
        *       otherwise the label will be added to every generated LabelList
        */
        this.add = function (label, labelList) {
            var generatedLabelLists = this.generated();
            html = '<span class= "label" data-hash='+ focus.generateHash()+ ' style="background-color:'+generatedLabelLists[0].color+'">' + label + '</span>';
            if (labelList) {                
                labelList.labels.push(label);
                this.__proto__.generate(html, labelList.element)
            } else {
                generatedLabelLists.forEach(function(generatedLabelList){
                    generatedLabelList.labels.push(label);
                    this.__proto__.generate(html, generatedLabelList.element)
                }.bind(this))
            }
            
        }

        /**
        * Removes specified label from the LabelList
        * @param {String} label - the label to remove
        * @param {DOMElement} labelList - the LabelList to remove the label from, since the LabelList constructor generates a LabelList per parent, there could be several LabelList generated.
        *       Therefore we should specify the one we want to remove the label from,
        *       otherwise the label will be removed from every generated LabelList
        */
        this.remove = function (label, labelList) {
            var generatedLabelLists = this.generated();
            if(labelList) {
                labelList.labels.splice(labelList.labels.indexOf(label), 1);
                labelList.element.querySelectorAll('.label')[index].remove()
            } else {
                generatedLabelLists.forEach(function(generatedLabelList){
                    var index = generatedLabelList.labels.indexOf(label)
                    generatedLabelList.labels.splice(index, 1);
                    generatedLabelList.element.querySelectorAll('.label')[index].remove();
                })
            }
        }
        var generated = this.generate(parentEl, obj);
        /**
        *   Gets the LabelList updated data
        */
        this.generated = function () {
            var toReturn = [];
            generated.forEach(function(generatedEl){
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            //generatedEl is just for debug, don't base anything on it
            self.generatedEl = toReturn;
            return toReturn;
        };
    }

    function ResultListDisplayer(parentSelector, obj, positionInNodeList) {
        var parentEl = this.checkParent(parentSelector);
        var self = this;
        this.generate = function (container, descriptor) {
            var html = '';
            var classes  = '';
            var res = [], ret;
            if (typeof descriptor.id !== 'undefined') {
                container = [container[0]];
            }
            if (!(descriptor.class instanceof Array)) {
                descriptor.class = []
            }
            Array.prototype.forEach.call(container, function (item, index){
                descriptor.class.indexOf('basic_ResultListDisplayer') === -1 ? descriptor.class.push('basic_ResultListDisplayer'):'';
                classes = descriptor.class.join(' ');
                var hash = focus.generateHash();
                html += '<div class ="' + classes + '" data-hash= ' + hash + ' data-index=' + index + ' id = '+(descriptor.id||"")+'>'
                html += '<span data-hash = '+focus.generateHash()+' data-index=' + index + '><</span>'
                var numberOfPages = Math.ceil(descriptor.list.length / descriptor.nbElPerPage);
                for (var i = 1; i <= numberOfPages ; i++) {
                    html += '<span data-hash = '+focus.generateHash()+' data-index=' + index + '>'+i+'</span>'
                }
                html += '<span data-hash = '+focus.generateHash()+' data-index=' + index + '>></span>'
                html += '</div>';
                ret = self.__proto__.generate(html, item, positionInNodeList);
                Array.prototype.forEach.call(ret.children, function (child) {
                    focus.bindEvent(child, [{
                        type: 'click',
                        handler: function(e) {
                            var currentResultListDisplayer = this.generated()[e.target.dataset.index];
                            var pageToDisplay = e.target.innerText || e.target.innerHTML;
                            if (isNaN(pageToDisplay)){
                                pageToDisplay = pageToDisplay === '<' ? currentResultListDisplayer.activeButton.innerText - 1 : currentResultListDisplayer.activeButton.innerText - (-1);
                                if (pageToDisplay < 1 || pageToDisplay > numberOfPages) {
                                    return;
                                }
                            }
                            currentResultListDisplayer.activeButton = Array.prototype.filter.call(currentResultListDisplayer.navButtons, function(pageIndex){
                                return (pageIndex.innerText == pageToDisplay || pageIndex.innerHTML == pageToDisplay);
                            })[0]
                            Array.prototype.forEach.call(currentResultListDisplayer.navButtons, function(pageIndex){
                                focus.removeClass(pageIndex, 'activeButton')
                            })
                            focus.addClass(currentResultListDisplayer.activeButton, 'activeButton')

                            if ((currentResultListDisplayer.previousActiveButton === currentResultListDisplayer.activeButton) && currentResultListDisplayer.previousActiveButton.innerHTML != 1) {
                                return;
                            }
                            currentResultListDisplayer.previousActiveButton = currentResultListDisplayer.activeButton
                            currentResultListDisplayer.currentPage = pageToDisplay | 0;
                            for (var i = (pageToDisplay - 1) * currentResultListDisplayer.nbElPerPage; i < pageToDisplay * currentResultListDisplayer.nbElPerPage; i++) {
                                if (i >= currentResultListDisplayer.fullList.length) {
                                    break;
                                }
                                currentResultListDisplayer.render(currentResultListDisplayer.fullList[i], i)
                                currentResultListDisplayer.alreadyGeneratedItems.push(i)
                            }                          

                        }.bind(self)
                    }])
                })
                
                var elData = {
                    hash: hash,
                    element: ret,
                    container: item,
                    navButtons: ret.children,
                    activeButton: ret.children[1],
                    previousActiveButton: ret.children[1],
                    alreadyGeneratedItems: [],
                    nbElPerPage: descriptor.nbElPerPage,
                    fullList: descriptor.list,
                    render: descriptor.render,
                    currentPage: 1
                };
                res = focus.recordElData(elData, res);
                if(typeof descriptor.events !== 'undefined') {
                    self.delegateEvent(hash, descriptor.events);
                }
            });
            return res;
        }
        var generated = this.generate(parentEl, obj);
        /**
        *   Gets the ResultListDisplayer updated data
        */
        this.generated = function () {
            var toReturn = [];
            generated.forEach(function(generatedEl){
                toReturn.push(focus.elDataArray.filter(function(elData){
                    return elData.hash == generatedEl.hash
                })[0])
            });
            //generatedEl is just for debug, don't base anything on it
            self.generatedEl = toReturn;
            return toReturn;
        };
        setTimeout(function(){
            var customEvent = new Event("click", {"bubbles":true, "cancelable":false});
            generated[0].activeButton.dispatchEvent(customEvent);
        }, 0)
        
    }

    ResultListDisplayer.prototype = focus;
    LabelList.prototype = focus;
    WordMatch.prototype = focus;
    Button.prototype = focus;
    Banner.prototype = focus;
    ImageTextZone.prototype = focus;
    Footer.prototype = focus;
    Menu.prototype = focus;
    Grid.prototype = focus;
    Accordion.prototype = focus;
    Popup.prototype = focus;
    Slider.prototype = focus;
    Scroller.prototype = focus;
    RateSlider.prototype = focus;