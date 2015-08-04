var cards, count = 0;
var userName;
var url = 'http://localhost:5000/api/cards/';
var loading = false;

var addressPrefix = 'addressbook-';
var otherDeviceAddress = 'All'; // default until a sync hapens
                                                // with another device(s)
var timerId;

//Save the post card
function saveCard(cardId, author, destination, content) {
  $.ajax({
    url: url + cardId,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ author: author, destination: destination, content: content }),
    dataType: 'json',
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error in saveCard ' + JSON.stringify(jqXHR) + ' ' + textStatus + ' ' + errorThrown);
    }
  });
}

//Delete the post card
function deleteCard(cardId) {
  $.ajax({
    url: url + cardId,
    type: 'DELETE',
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error in deleteCard ' + JSON.stringify(jqXHR) + ' ' + textStatus + ' ' + errorThrown);
    }
  });
}

// add event handlers to a card
function addCardEvent(cardElement) {
  var div = cardElement.children('div');
  var closeImg = div.find('img');

  div.focus(function () {
    closeImg.removeClass('hide');
  });

  div.children().focus(function () {
    closeImg.removeClass('hide');
  });

  div.hover(function () {
    closeImg.removeClass('hide');
  }, function () {
    closeImg.addClass('hide');
  });

  div.children().hover(function () {
    closeImg.removeClass('hide');
  }, function () {
    closeImg.addClass('hide');
  });
}

// adds a new postcard to the 'cards' list
function addNewCard(cardId, title, destination, content) {
  var className = 'color' + Math.ceil(Math.random() * 3);
  cardId || (cardId = generateUUID());

  // add a new card to the end of the list
  cards.append('<li><div class="' + className + '">' +
    '<input type="hidden" id="cardId" value="' + cardId + '">' +
    '<textarea readonly class="card-title" placeholder="Owner" maxlength="10"/>' +
    '<textarea readonly class="card-destination" placeholder="Destination" maxlength="10"/>' +
    '<textarea class="card-content" placeholder="Your content here"/>' +
    '<img  src="close.png"/>' +
    '</div></li>');

  // get the new card that's just been added and attach the click event handler to its close button
  var newCard = cards.find('li:last');
  newCard.find('img').click(function () {
    // remove the card and save
    deleteCard(newCard.find('input[type=hidden]').val());
    newCard.remove();
  });

  //Add the update handler
  newCard.find('textarea.card-content').blur(function () {
    saveCard(newCard.find('input[type=hidden]').val(),
      newCard.find('textarea.card-title').val(),
      newCard.find('textarea.card-destination').val(),
      newCard.find('textarea.card-content').val() );
  });

  // hook up event handlers to show/hide close button as appropriate
  addCardEvent(newCard);

  // if a title is provided then set the title of the new card
  if (title) {
    newCard.find('textarea.card-title').val(title);
  } else {
    newCard.find('textarea.card-title').val(userName);//Use the current userName
  }

  if (destination) {
    newCard.find('textarea.card-destination').val(destination);
  } else {
    newCard.find('textarea.card-destination').val(otherDeviceAddress);
  }

  // if a content is provided then set the content of the new card
  if (content) {
    newCard.find('textarea.card-content').val(content);
  }

  if(!loading) {
    saveCard(
      newCard.find('input[type=hidden]').val(),
      newCard.find('textarea.card-title').val(),
      newCard.find('textarea.card-destination').val(),
      newCard.find('textarea.card-content').val()
    );
  }
}

// load the cards saved in the local storage
function loadCards() {
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    success: function (data) {
      loading = true;
      $.each(data.rows, function(_, element) {
        // look for all addressbook entries
        if (element.doc._id != null
            && element.doc._id.match(addressPrefix) != null) {
          if(element.doc.author != null
            && element.doc.author != userName) {
            // found the address of the other device
            otherDeviceAddress = element.doc.author;
          }
        } else {
          // found a postcard entry
          addNewCard(element.id, element.doc.author,
            element.doc.destination, element.doc.content);
          count++;
        }
      });
      // add a card to the list if there aren't any
      if (count === 0) { addNewCard(''); }
      loading = false;
    }
  });

}

//generate unique id for postcard
function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}

$(document).ready(function () {
  // get references to the 'cards' list
  cards = $('#cards');

  // clicking the 'New card' button adds a new card to the list
  $('#btnNew').click(function () {
    addNewCard('');
  });

  $("#btnRefresh").click(refreshCards);

  userName = $('#userId').val();
  
  // hide the login items during initialization
  var e = document.getElementById('login');
  if(e) {
    e.style.display = 'none';
  } else {
    console.log('could not get handle to login controls.');
  }

  if(!userName) {
    // hide the controls until the current device address is available
    var e = document.getElementById('controls');
    if(e) {
      e.style.display = 'none';
    } else {
      console.log('could not get handle to controls.');
    }

    // start the timer to get the user-name of the current device
    timerId = setTimeout(function() {
      getDeviceAddress();
    }, 1000);
  } else { // user name is available
    // load cards from local storage if one's available
    loadCards();
  }
});

function getDeviceAddress() {

  // make a request to get the current device address
  $.ajax({
    type: 'GET',
    url: 'http://localhost:5000/getDeviceAddress/',
    dataType: 'json',
    
    success: function (data) {
      userName = data;
      // show the controls as the current device address is now available
      var e = document.getElementById('controls');
      if(e) {
        e.style.display = 'block';
      } else {
        console.log('could not get handle to controls.');
      }
      
      // load cards now as current username is now available
      loadCards();
    },

    // got error for the request
    error: function(jqXHR, textStatus, errorThrown) {
      // show the login items now as the current device address is unavailable
      var e = document.getElementById('login');
      if(e) {
        e.style.display = 'block';
      } else {
        console.log('could not get handle to login controls.');
      }
    }
  });
}

function refreshCards() {
  $('#cards').empty();
  loadCards();
}
