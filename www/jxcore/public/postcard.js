var cards, count = 0;
var userName = 'Self'; //Default to 'self'
var url = 'http://localhost:5000/api/cards/';
var saveCardloading = false;

var addressPrefix = 'addressbook-';

//Save the post card
function saveCard(cardId, author, destination, content) {
  $.ajax({
    url: url + cardId,
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ author: author, destination: destination, content: content }),
    dataType: 'json',
    success: function(data, status, xhr) {
      console.log('success in saveCard');
    },
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
    success: function(data, status, xhr) {
      console.log('success in deleteCard');
    },
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

//  adds a new postcard to the 'cards' list
function addNewCard(cardId, title, destination, content) {
  var className = 'color' + Math.ceil(Math.random() * 3);
  cardId || (cardId = generateUUID());

  console.log('addNewCard - cardId: ', cardId);

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
    console.log('Add the update handler - calling  - saveCard()');
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
    //TODO: query the DB and find the address of the "other" device"
    newCard.find('textarea.card-destination').val('addr-dest');
  }

  // if a content is provided then set the content of the new card
  if (content) {
    newCard.find('textarea.card-content').val(content);
  }

  if(!loading) {
    console.log('if(!loading) - calling  - saveCard()');
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
      console.log('userName is set to: ', userName);
      $.each(data.rows, function(_, element) {
      console.log('found 1 element');
        if (element.doc._id != null
            && element.doc._id.match(addressPrefix) != null) {
          console.log('found an addressbook entry: ', element.doc._id);
        } else {
          console.log('found a postcard entry - element.id: ', element.id);
          console.log('found a postcard entry - element.doc.id: ', element.doc.id);
          console.log('found a postcard entry - element.doc._id: ', element.doc._id);
          console.log('found a postcard entry - element.doc.author: ', element.doc.author);
          console.log('found a postcard entry - element.doc.destination: ', element.doc.destination);
          console.log('found a postcard entry - element.doc.content: ', element.doc.content);
          addNewCard(element.id, element.doc.author,
            element.doc.destination, element.doc.content);
          count++;
        }
      });
      // add a card to the list if there aren't any
      if (count === 0) { console.log('count === 0 - calling addNewCard()'); addNewCard(''); }
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

  // load cards from local storage if one's available
  loadCards();

  // clicking the 'New card' button adds a new card to the list
  $('#btnNew').click(function () {
    addNewCard('');
  });

  $("#btnRefresh").click(refreshCards);

  userName = $('#userId').val();
  console.log('userName is set to: ', userName);
});

function refreshCards() {
  $('#cards').empty();
  loadCards();
}
