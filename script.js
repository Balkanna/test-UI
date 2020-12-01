const LOCALSTORAGE_KEY = 'messages';

class Message {
  constructor(id, createdAt, author, text, isPersonal, to) {
    this._id = id;
    this._createdAt = createdAt;
    this._author = author;
    this._text = text;
    this._to = to;
    this._isPersonal = isPersonal;
  }

  get id() {    
    return this._id;
  }

  set id(id) {    
    throw new Error('Deny to edit object field.')
  }

  get createdAt() {
    return this._createdAt;
  }

  set createdAt(value) {
    throw new Error('Deny to edit object field.')
  }

  set text(value) {
    this._text = value.slice(0, 200);  
  }

  get text() {
    return this._text;
  }

  get author() {
    return this._author;
  }

  set author(value) {
    throw new Error('Deny to edit object field.')
  }

  get to(){
    return this._to;
  }

  set to(value) {
    this._to = value;
    this._to !== undefined ? this._isPersonal = true : this._isPersonal = false;
  }

  get isPersonal() {
    return this._isPersonal;
  }

  set isPersonal(value) {
    this._isPersonal = value;
  }
}

class MessageList {
  constructor(messages = []) {
    this._messages = messages;
    this._user = null;
  }

  get user() {
    return this._user;
  }

  set user(user) {
    this._user = user;
  }

  get messages() {
    return this._messages;
  }

  set messages(value) {
    this._messages = value;
  }

  restore() {
    const rawMessages = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
    this._messages = rawMessages.map((item) => new Message(item));
  }

  save() {
    localStorage.setItem(
      LOCALSTORAGE_KEY, JSON.stringify(this._messages)
    );
  }
   
  get(id) {
    return this._messages.find(item => item.id === id);
  };

  getPage(skip = 0, top = 10, filterConfig = {}) {
    const filterObj = {
      text: (item, text) => text && item.text.toLowerCase().includes(text.toLowerCase()),
      author: (item, author) => author && item.author.toLowerCase().includes(author.toLowerCase()),
      dateTo: (item, dateTo) => dateTo && item.createdAt < dateTo,
      dateFrom: (item, dateFrom) => dateFrom && item.createdAt > dateFrom
    }

    let result = this._messages.slice().filter(item => {
      return (item.author === this.user || ((item.isPersonal === true && item.to === this.user) || item.isPersonal === false));
    });
  
    Object.keys(filterConfig).forEach(key => {
      result = result.filter(item => filterObj[key](item, filterConfig[key]));
    });

    result = result.sort((a, b) => {
      return  b.createdAt - a.createdAt;
    }); 

    return result.slice(skip, skip+top);
  };

  add(msg) {
    const newMsg = new Message(Math.random().toString(36).substr(2, 10), new Date(), this.user, msg.text, msg.isPersonal, msg.to);
    if (MessageList.validate(newMsg) && msg.author === this.user) {
      this._messages.push(newMsg);
      this.save();
      return true; 
    }
    return false; 
  };

  static validate(msg){
    const validateObj = {
      id: (msg) => msg.id && typeof msg.id === 'string',
      text: (msg) => msg.text && typeof msg.text === 'string' && msg.text.length <= 200,
      author: (msg) => msg.author && typeof msg.author === 'string',
      createdAt: (msg) => msg.createdAt,
      isPersonal: (msg) => {
        if ((msg.isPersonal === false && !msg.to)
          || (msg.isPersonal && msg.to && typeof msg.to === 'string')) {
          return typeof msg.isPersonal === 'boolean';
        }
        return false;
      }
    }
    return Object.keys(validateObj).every(key => validateObj[key](msg));  
  };

  edit(id, msg) {
    const editObj = {
      text: (item, text) => text ? item.text = text : item.text,
      to: (item, to) => to ? item.to = to : item
    };

    const msgIndex = this._messages.findIndex((msg) => msg.id === id);
    const copyObj = Object.assign({}, this._messages[msgIndex]);

    Object.keys(editObj).forEach(key => editObj[key](copyObj, msg[key]));

    if (msgIndex !== -1 && this._messages[msgIndex].author === this.user) {
      if (MessageList.validate(copyObj)) {
        this._messages[msgIndex] = copyObj;
        this.save();
        return true;
      }
    }
    return false;
  };

  remove(id) {
    let index = this._messages.findIndex(item => item.id === id);

    if (this._messages[index].author === this.user && index !== -1 ) {
      this._messages.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  } 

  addAll(messages) {
    let invalidMessages = [];

    messages.forEach(msg => {
      MessageList.validate(msg) ? this._messages.push(msg) : invalidMessages.push(msg);
    });
    return invalidMessages;
  }

  clear() {
    this._messages = [];
    this.save();
  }
}

class UserList {
  constructor(users = [], activeUsers = []) {
    this._users = users;
    this._activeUsers = activeUsers;
  }

  get activeUsers() {
    return this._activeUsers;
  }

  get users() {
    return this._users;
  }
}

class HeaderView {
  constructor(id) {
    this.id = id;
  }

  display(user) {
    let userHeader = document.getElementById(this.id);
    let messageSend = document.getElementById("message-send");
    let btnAuthorization = document.getElementById("header");

    messageSend.innerHTML = `<input class="message-send__input" type="text" placeholder="Write a message..." ${messageList.user !== undefined ? '' : 'disabled'}>
    <button type="submit" class="message-send__icon">
      <span class="iconify" data-icon="ic-round-send" data-inline="false"></span>
    </button>`
  
    btnAuthorization.innerHTML = 
    `<div class="container">
      <div class="header__inner">
        <div class="header__logo">
          <img src="./images/logo_chat.png" alt="logo" class="logo">
        </div>
        <div class="header__authorization" id="header__authorization">
          <div class="name-authorization" id="name-authorization">${messageList.user ? user : ''}</div>
          ${(messageList.user !== undefined) ?
          `<button class="btn-sign-out btn" id="btn-sign-out" type="button">Sign Out</button>`:
          `<button class="btn-sign-in btn" id="btn-sign-in" type="button">Sign In</button>`}
        </div>
      </div>
    </div>`;
  }
}

class ActiveUsersView {
  constructor(id) {
    this.id = id;
  }

  display(activeUsers) {
    const activeUsersListContainer = document.getElementById(this.id);
    const innerHTML = activeUsers.map( user => (`
        <div class="user-info">
          <div class="circle"></div>
          <span class="user-name">${user}</span>
          <span class="user-status">online</span> 
        </div>
      `)).join(``);

    activeUsersListContainer.innerHTML = innerHTML;
  }
}

class MessagesView {
  constructor(id) {
    this.id = id;
  }

  display(msgs) {
    const messagesList = document.getElementById(this.id);
    messagesList.innerHTML = msgs.map( msg => {
      let createdAt = msg.createdAt.toLocaleDateString();
      let time = msg.createdAt.toLocaleTimeString().slice(0, -3);

      return (`
        <div class="message-chat">
          <div class="message-chat__info ${msg.author === messageList.user ? "user-chat__info" : "" }">
            <div class="message__name">${msg.author}</div>
            <div class="message__time">${time}</div>
            <div class="message__date">${createdAt}</div>
          </div>
          <div class="message__container ${msg.author === messageList.user ? "user-message" : "" }">
            <div class="message__text">${msg.text}</div>
            ${msg.author === messageList.user ? 
            `<div class="user-message__change">
              <button button class="btn-edit" id="btn-edit" title="Edit"><span class="iconify" data-icon="ic-baseline-edit" data-inline="false"></span></button>
              <button class="btn-delete" id="btn-delete" title="Delete"><span class="iconify" data-icon="ic-baseline-delete-outline" data-inline="false"></span></button>
            </div>` : ''}
          </div>
        </div>
      `)
    }).join('');
  } 
}

class ChatController {
  constructor() {
    this.userList = new UserList(['Alexander', 'Alice', 'Elon', 'Max','Tom', 'Natasha'], ['Alexander', 'Alice', 'Elon', 'Max','Tom']);
    this.activeUsersView = new ActiveUsersView('users-list__content');
    this.headerView = new HeaderView('header');
    this.messagesView = new MessagesView('messages-block');
  }

  setCurrentUser(user) {
    messageList.user = user;
    this.headerView.display(user);
  }

  showActiveUsers() {
    this.activeUsersView.display(this.userList.activeUsers);
  }

  showMessages(skip = 0, top = 10, filterConfig = {}) {
    this.messagesView.display(messageList.getPage(skip, top, filterConfig));
  }

  addMessage(msg) {
    if (messageList.add(msg)) {
      this.showMessages(0, 10);
    }
  }

  removeMessage(id) {
    messageList.remove(id);
    this.messagesView.display(messageList.getPage());
  }

  editMessage(id, msg) {
    messageList.edit(id, msg);
    this.messagesView.display(messageList.getPage());
  }

  moveToLoginPage() {
    document.getElementById('main').style.display = "none";
    document.getElementById('authorization-container').style.display = "block";
    document.getElementById('registration-container').style.display = "none";
    btnSignInHeader.style.display = "none";
  }

  moveToRegistrPage() {
    document.getElementById('registration-container').style.display = "block";
    document.getElementById('authorization-container').style.display = "none";
    btnSignInHeader.style.display = "none";
  }

  returnToChatPage() {
    document.getElementById('registration-container').style.display = "none";
    document.getElementById('authorization-container').style.display = "none";
    document.getElementById('main').style.display = "block";
    btnSignInHeader.style.display = "block";
  }

  returnToChatPage2() { //TODO после установки signin нельзя войти в авторизацию
    controller.setCurrentUser();
    document.getElementById('main').style.display = "block";
    //btnSignInHeader.style.display = "block";
    btnSignOut.style.display = "none";
    console.log('Click!');
  }

  activateFilter(event){
    event.preventDefault();
    let text = document.getElementById('textFilter').value;
    let author = document.getElementById('nameFilter').value;
    let dateFrom = document.getElementById('fromDateFilter').value;
    let dateTo = document.getElementById('toDateFilter').value;
    console.log(text, author, dateTo, dateFrom);
    return controller.showMessages(0, 20, {text, author, dateTo, dateFrom}); //TODO
  }
}



const messageList = new MessageList([
  {
    id: '1',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:00'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: '2',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:05'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: '3',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:07'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: '4',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:01:00'),
    author: 'Elon',
    isPersonal: false,
  },
  {
    id: '5',
    text: 'Lorem lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:01:08'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: '6',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:02:00'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: '7',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:05:00'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: '8',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:05:02'),
    author: 'Alice',
    isPersonal: false,
  },
  {
    id: '9',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:07:03'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: '10',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:00:00'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: '11',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:05:00'),
    author: 'Elon',
    isPersonal: false,
  },
  {
    id: '12',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:05:10'),
    author: 'Max',
    isPersonal: false,
  },
  {
    id: '13',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:06:00'),
    author: 'Anna',
    isPersonal: true,
    to: 'Alice',
  },
  {
    id: '14',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:07:01'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: '15',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:04:09'),
    author: 'Alexander',
    isPersonal: true,
    to: 'Alice',
  },
  {
    id: '16',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:05:00'),
    author: 'Anna',
    isPersonal: true,
    to: 'Tom',
  },
  {
    id: '17',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:08:07'),
    author: 'Max',
    isPersonal: false,
  },
  //invalid message
  {
    id: '18',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:00'),
    author: 'Anna',
    isPersonal: true,
  },
  {
    id: '19',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:03'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: '20',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:07'),
    author: 'Anna',
    isPersonal: false,
  }
]); 

const controller = new ChatController();

controller.setCurrentUser('Anna');
controller.showActiveUsers(this.userList);
controller.showMessages();
controller.editMessage('19', {text: 'Hello! I have already changed the text of this message!'});
//controller.removeMessage('20');
controller.addMessage(new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Anna','Hello! I have already added the new message! Wow)', false));

/*const btnSignInHeader = document.getElementById("btn-sign-in");
btnSignInHeader.addEventListener('click', controller.moveToLoginPage);*/
const linkSignIn = document.getElementById("link-sign-in");
linkSignIn.addEventListener('click', controller.moveToLoginPage);

const btnSignOut = document.getElementById("btn-sign-out");
btnSignOut.addEventListener('click', controller.returnToChatPage2); //TODO ОТРИСОВАТЬ СТРАНИЦУ ПОСЛЕ ВЫХОДА ЮЗЕРА*/

const linkSignUp = document.getElementById("link-sign-up");
linkSignUp.addEventListener('click', controller.moveToRegistrPage);

const linkBackToChat = document.getElementById("back-link-signin");
linkBackToChat.addEventListener('click', controller.returnToChatPage);
const linkBackToChat2 = document.getElementById("back-link-signup");
linkBackToChat2.addEventListener('click', controller.returnToChatPage);

const btnFilter = document.getElementById("btn-filter");
btnFilter.addEventListener('click', controller.activateFilter);

const btnDelete = document.getElementById("btn-delete");
//btnDelete.addEventListener('click', controller.removeMessage);

const messagesBlock = document.getElementById("messages-block");
messagesBlock.addEventListener('click', event => {
  const target = event.target;
  const targetClassList = target.classList;

  switch (true) {
      case targetClassList.contains('message-chat'):
      //case targetClassList.contains('task__title'):
        break;

      case targetClassList.contains('btn-edit'):
        controller.removeMessage.editMessage(target.parentNode);
        break;

      case targetClassList.contains('btn-delete'):
        controller.removeMessage.removeMessage(target.parentNode.parentNode);
        break;
  }
});



/*const userList = new UserList(['Alexander', 'Alice', 'Elon', 'Max','Tom', 'Natasha'], ['Alexander', 'Alice', 'Elon', 'Max','Tom']);
const activeUsersView = new ActiveUsersView('users-list__content');
const headerView = new HeaderView('header');
const messagesView = new MessagesView('messages-block');

setCurrentUser();
showActiveUsers();
showMessages(0, 10);
editMessage('19', {text: 'Hello! I have already changed the text of this message!'});
removeMessage('20');
addMessage(new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Anna','Hello! I have already added the new message! Wow)', false));
*/

/*console.log('Msgs collections: ', messageList);
console.log('Get message id = 3: ', messageList.get('3'));
console.log('Get messages (default): ', messageList.getPage());
console.log('Get 10 messages: ', messageList.getPage(0,10));
console.log('Get messages of users with name "Tom": ', messageList.getPage(0, 10, {author: 'Tom'}));
console.log('Get messages of users with "Tom" substr in author and "Lorem lorem" in text: ', messageList.getPage(0, 20, {
	author: 'Tom',
  text: 'Lorem lorem'
}));
console.log('Get messages of users (date): ', messageList.getPage(0, 20, {
  dateFrom: new Date('2020-10-12T20:00:07'),
  dateTo: new Date('2020-10-12T22:05:00')
}));
console.log('Add the message, where author = user: ', messageList.add(new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Anna','Hi Alice', true, 'Alice')));
console.log('Example: ', new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Anna','Hi Alice', true, 'Alice'));
console.log('Msgs collections after adding the valid message, where author = user: ', messageList);
console.log('Add the message, where author != user: ', messageList.add(new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Elon','Hi Alice', true, 'Alice')));
console.log('Msgs collections after adding the valid message, where author != user: ', messageList);
console.log('Msg example, where text > 200 words: ', {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  createdAt: new Date('2020-10-12T20:00:00'),
  isPersonal: false
});
console.log('Add the invalid message (>200 words): ', messageList.add({
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  createdAt: new Date('2020-10-12T20:00:00'),
  isPersonal: false
}));
console.log('Msgs collections after adding the invalid message (>200 words): ', messageList);
console.log('Check valid message:', MessageList.validate(new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Anna','Hi Tom', true, 'Alice')));
console.log('Check invalid message:', MessageList.validate(new Message(Math.random().toString(36).substr(2, 10), new Date(), 'Anna','Hi Alice', true)));
console.log('Edit message, where author = user:', messageList.edit('15', {text:'I changed!'}));
console.log('Edit message, where author != user:', messageList.edit('4', {text:'Hello World!'}));
console.log('Msgs collections after editing: ', messageList);
console.log('Remove message id = 3, where author = user:', messageList.remove('3'));
console.log('Remove message id = 1, where author != user:', messageList.remove('1'));
console.log('Msgs collections after removing: ', messageList);
console.log('Add all:', messageList.addAll(messageList));*/

//console.log(messageList.clear(messages));
//console.log( 'Msgs collections after clearing: ', messageList);*/