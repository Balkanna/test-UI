let count = 1;
const generatorId = () => (count++).toString();

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

  //TODO
  editMessage(text, to) {
    this.to = to;
    this.text = text;
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
    const rawMessages = JSON.parse(localStorage.getItem());
    this._messages = rawMessages.map((item) => new Message(item));
  }

  save() {
    localStorage.setItem('messages', JSON.stringify(this._messages));
    localStorage.setItem('users', JSON.stringify(this.users)); //???
    localStorage.setItem('currentUser', JSON.stringify(this.user));
  }
   
  get(id) {
    return this._messages.find(item => item.id === id);
  };

  getPage(skip = 0, top = 10, filterConfig = {}) {
    const filterObj = { 
      text: (item, text) => text && item.text.toLowerCase().includes(text.toLowerCase()),
      author: (item, author) => author && item.author.toLowerCase().includes(author.toLowerCase()),
      dateTo: (item, dateTo) => dateTo && item.createdAt < dateTo,
      dateFrom: (item, dateFrom) => dateFrom && item.createdAt > dateFrom,
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
    console.log(this);
    const newMsg = new Message(/*Math.random().toString(36).substr(2, 10)*/generatorId(), new Date(), this.user, msg.text, msg.isPersonal, msg.to);
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
  constructor(users, activeUsers) {
    this._users = users;
    this._activeUsers = activeUsers || false;
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
    let btnAuthorization = document.getElementById("header");
    let messageSend = document.getElementById("message-send");
    /*${(messageList.user !== undefined) ?
          `<button class="btn-sign-out btn" id="btn-sign-out" type="button">Sign Out</button>`:
          `<button class="btn-sign-in btn" id="btn-sign-in" type="button">Sign In</button>`} */
  
    btnAuthorization.innerHTML = 
    `<div class="container">
      <div class="header__inner">
        <div class="header__logo">
          <img src="./images/logo_chat.png" alt="logo" class="logo">
        </div>
        <div class="header__authorization" id="header__authorization">
          <div class="name-authorization" id="name-authorization">${messageList.user ? user : ''}</div>
          ${(messageList.user !== undefined) ?
            `<button class="btn-sign-out btn" id="btn-sign-out" type="button" onclick="controller.returnToChatPage2()">Sign Out</button>`:
            `<button class="btn-sign-in btn" id="btn-sign-in" type="button" onclick="controller.moveToLoginPage()">Sign In</button>`}
        </div>
      </div>
    </div>`;

    messageSend.innerHTML = 
      `<form class="form-send-message" id="form-send-message" onsubmit="event.preventDefault(); controller.sendMessage(event)">
        <textarea class="message-send__input" id="message-send__input" type="text" placeholder="Write a message..." ${messageList.user !== undefined ? '' : 'disabled'}></textarea>
        <button type="submit" class="message-send__icon" id="message-send__icon" ${messageList.user !== undefined ? '' : 'disabled'}>
          <span class="iconify" data-icon="ic-round-send" data-inline="false"></span>
        </button>
      </form>
      `
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
        <div class="message-chat" id="message-chat">
          <div id="message-chat__info" class="message-chat__info ${msg.author === messageList.user ? "user-chat__info" : "" }">
            <div class="message__name">${msg.author}</div>
            <div class="message__time">${time}</div>
            <div class="message__date">${createdAt}</div>
          </div>
          <div id="message__container" class="message__container ${msg.author === messageList.user && messageList.user !== undefined ? "user-message" : "" }">
            <div class="message__text">${msg.text}</div>
            ${msg.author === messageList.user ? 
            `<div class="user-message__change" id="user-message__change">
              <button class="btn-edit" id="btn-edit" title="Edit" data-message-id="${msg.id}" onclick="controller.editMessage(this)"><i class="fas fa-pencil-alt icon-edit"></i></button>
              <button class="btn-delete" id="btn-delete" onclick="controller.removeMessage(${msg.id})" title="Delete"><i class="fas fa-trash-alt icon-delete" id="icon-delete"></i></button>
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
    this._numberLoadedMessages = 10;   

    const reset = document.getElementById("btn-reset");
    reset.addEventListener('click', this.reset);
    const btnRegistrationForm = document.getElementById('registration-form');
    btnRegistrationForm.addEventListener('submit', this.signUp);
    const btnAuthorizationForm = document.getElementById('authorization-form');
 
    //btnAuthorizationForm.addEventListener('submit', this.signIn);
    // this.signUpLogin = document.getElementById('sign-up-login'); 
    // this.signUpPassword = document.getElementById('sign-up-password'); 
    // this.confirmPassword = document.getElementById('sign-up-confirm'); 
    // this.signUpAction = document.getElementById('registration-button');

    this.messageText = document.querySelector('#message-send__input');
    this.messageSubmit = document.querySelector('#message-send__icon');
    // this.msg = {};
  }

  get numberLoadedMessages() {
    return this._numberLoadedMessages;
  }

  set numberLoadedMessages(num) {
      this._numberLoadedMessages = num;
  }

  setCurrentUser(user /*= localStorage.currentUser*/) {
    /*localStorage.setItem('currentUser', user);*/
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
    if (confirm('Do you want to delete this message?')) {
      messageList.remove(id.toString());
      this.messagesView.display(messageList.getPage());
      messageList.save();
    }
  }

  /*editMessage(id, msg) {
    console.log('Click edit');
    messageList.edit(id.toString(), msg);
    this.messagesView.display(messageList.getPage());
    messageList.save();
  }*/

  editMessage(elem) {
    const id = elem.dataset.messageId;
    console.log(elem.dataset.messageId); 

    //this.messageSubmit.onclick = null;
    //document.getElementById('form-send-message').onsubmit = null;
    //const usersNode = document.getElementById('users');

    let editedMsg = messageList.messages.find(msg => msg.id === id.toString()); 
    console.log(editedMsg);
    /*this.messageText*/document.querySelector('#message-send__input').value = editedMsg.text;
    console.log(editedMsg);
    /*if (editedMsg.isPersonal) {
      this.displayTo.innerHTML = editedMsg.to;
    }
    
    usersNode.addEventListener('click', (event) => {
      this.displayTo.innerHTML = event.target.textContent;
      this.msg.to = event.target.textContent;
      console.log('Choose whom: ', this.msg.to);
    });*/

    document.getElementById('form-send-message').onsubmit = () => {
      //this.msg.to = this.displayTo.innerHTML;
      msg.text = document.querySelector('#message-send__input').value;
      console.log('Ready to edit', msg);
      if (messageList.edit(id.toString(), msg)) {
        this.messageView.display(messageList.getPage(), messageList.user);
        document.querySelector('#message-send__input').value = '';
        messageList.save();
        //localStorage.setItem('messages', JSON.stringify(this.messages));
      }
      this.messageSubmit.onsubmit = addItem;
    }
    
  }


  moveToLoginPage() {
    document.getElementById('main').style.display = "none";
    document.getElementById('authorization-container').style.display = "block";
    document.getElementById('registration-container').style.display = "none";
    btnSignInHeader.style.display = "none";
  }

  moveToRegistrationPage() {
    document.getElementById('registration-container').style.display = "block";
    document.getElementById('authorization-container').style.display = "none";
    btnSignInHeader.style.display = "none";
  }

  defaultPage() {
    this.showMessages(0, 10);
    document.getElementById('registration-container').style.display = "none";
    document.getElementById('authorization-container').style.display = "none";
    document.getElementById('main').style.display = "block";
  }

  returnToChatPage() {
    controller.defaultPage();
    btnSignInHeader.style.display = "block";
  }

  returnToChatPage2() {
    controller.setCurrentUser();
    controller.defaultPage();
    controller.showMessages(0, 10);
    //controller.moveToRegistrationPage();
    console.log('Click: back!');
  }

  getFilterResult() {
    const filterConfig = {};

    let author = document.getElementById('nameFilter').value;
    let text = document.getElementById('textFilter').value;
    let dateFrom = new Date(document.getElementById('fromDateFilter').value);
    let dateTo = new Date(document.getElementById('toDateFilter').value);

    if (author) {
      filterConfig.author = author;
    };

    if (text) {
      filterConfig.text = text;
    };

    if (dateFrom.toString() !== 'Invalid Date') {
      filterConfig.dateFrom = dateFrom;
    };

    if (dateTo.toString() !== 'Invalid Date') {
      filterConfig.dateTo = dateTo;
    };

    /*if (!author || !text || !dateTo.toString() || !dateTo.toString()) {
      document.querySelector('.empty-result').style.display = "inline";
    
      console.log('There are no results for this filter.');
    };*/
   
    this.showMessages(0, 10, filterConfig);
    console.log('Submit form');
  }

  reset() {
    document.getElementById("main__filter").reset();
  };

  sendMessage(msg) {
    let messageField = document.querySelector('#message-send__input');
    let messageText = messageField.value;
    this.addMessage({ author: this.user, text: messageField.value, isPersonal: false });
    if (this.addMessage(msg)) {
      //messageText = '';
      messageField.value= '';
    }
    console.log('Click: add new message!');
    console.log(MessageList.validate(msg)); //TODO false
  }

  loadMoreMessages() {
    let number = this.numberLoadedMessages + 10;
    this.showMessages(0, number);
    this.numberLoadedMessages = number;
  }

  signUp(event) {
    event.preventDefault();
    const signUpLogin = document.getElementById('sign-up-login'); 
    const signUpPassword = document.getElementById('sign-up-password'); 
    const confirmPassword = document.getElementById('sign-up-confirm'); 
    
    console.log('login value - ', signUpLogin.value);
    console.log('pwd value - ', signUpPassword.value);
    console.log('confirm-pwd value - ', confirmPassword.value);
    console.log('before signup users ', this.users);

    if (users.filter(item => item.user === signUpLogin.value).length === 1) {
      signUpLogin.style.border = 'var(--border-error)';
      document.getElementById('error-login').style.display = "inline";
    }

    else if (!signUpLogin.value || signUpLogin.value === ' ') {
      console.log('1 Error');
      signUpLogin.style.border = 'var(--border-error)';
      signUpPassword.style.border = 'var(--border-error)';
      confirmPassword.style.border = 'var(--border-error)';
      document.getElementById('error-empty').style.display = "inline";
    }
  
    else if (!signUpPassword.value || !confirmPassword.value || signUpPassword.value !== confirmPassword.value) {
      console.log('2 Error');
      signUpPassword.style.border = 'var(--border-error)';
      confirmPassword.style.border = 'var(--border-error)';
      document.getElementById('error-empty').style.display = "none";
      document.getElementById('error-not-match').style.display = "inline";
    } 

    else {
      const values = {};
      values.user = signUpLogin.value;
      values.password = signUpPassword.value;
      console.log(values);
      //const users = [];
      users.push(values);
      messageList.user = signUpLogin.value;
      controller.setCurrentUser(messageList.user);
      controller.defaultPage();
      messageList.save();
  
      
      console.log('after signup users ', users);
    }
    console.log('Клик!');
  }
    
  signIn() {
    //event.preventDefault();
    
    const signInLogin = document.getElementById('sign-in-login'); 
    const signInPassword = document.getElementById('sign-in-password'); 
   
    
    console.log('login name value - ', signInLogin.value);
    console.log('password value - ', signInPassword.value);
    console.log('users - ', users);

    if (users.filter((item) => item.user === signInLogin.value).length !== 1) {
    //this.loginDisplay();
      signInLogin.style.border = 'var(--border-error)';
      signInPassword.style.border = 'var(--border-error)';
      console.log('login is not existed');
    }
    else if (users.filter( item => item.user === signInLogin.value === 1)) {

      let values = users.filter( item => item.user === signInLogin.value);
      signInLogin.style.border = 'var(--error-color)';
      console.log(values[0]);

      if (values[0].password === signInPassword.value) {
        console.log('It is match!');
        document.getElementById('authorization-container').style.display = "none";
        this.user = signInLogin.value;
        this.setCurrentUser(this.user);
        this.defaultPage();
        messageList.save();
      }
      else {
        signInPassword.style.border = 'var(--border-error)';
        document.getElementById('error-message').style.display = "inline";
        console.log('Incorrect password!');
      }
    }
    //console.log(this.users);

  }

}


const messageList = new MessageList([
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:00'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:05'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:07'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:01:00'),
    author: 'Elon',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:01:08'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:02:00'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:05:00'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:05:02'),
    author: 'Alice',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:07:03'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:00:00'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:05:00'),
    author: 'Elon',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:05:10'),
    author: 'Max',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:06:00'),
    author: 'Anna',
    isPersonal: true,
    to: 'Alice',
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:07:01'),
    author: 'Tom',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:04:09'),
    author: 'Alexander',
    isPersonal: true,
    to: 'Alice',
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:05:00'),
    author: 'Anna',
    isPersonal: true,
    to: 'Tom',
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:08:07'),
    author: 'Max',
    isPersonal: false,
  },
  //invalid message
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:00'),
    author: 'Anna',
    isPersonal: true,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:03'),
    author: 'Anna',
    isPersonal: false,
  },
  {
    id: generatorId(),
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:07'),
    author: 'Anna',
    isPersonal: false,
  }
]); 
const users = [{user: 'Anna', password: '777'}];

const controller = new ChatController();

controller.setCurrentUser();
controller.showActiveUsers(this.userList);
controller.showMessages();
//controller.editMessage('19', {text: 'Hello! I have already changed the text of this message!'});
//controller.removeMessage('20');
//controller.addMessage(new Message(generatorId(), new Date(), 'Anna','Hello! I have already added the new message! Wow)', false));

const btnLoadMessages = document.getElementById("btn-load-messages");
btnLoadMessages.addEventListener('click', () => {controller.loadMoreMessages()});

/*const messagesBlock = document.getElementById("messages-block"); //TODO
messagesBlock.addEventListener('click', event => {
  const target = event.target;
  const targetClassList = target.classList;

  switch (true) {
    case targetClassList.contains('messages-block'):
      break;

    case targetClassList.contains('icon-edit'):
      controller.editMessage(target.id);
      console.log('Edit!');
      break;

    case targetClassList.contains('icon-delete'):
      confirm("Do you want to delete this message?");
      controller.removeMessage(target.parentNode.parentNode.parentNode.parentNode.removeChild.id);
      console.log("Delete!");
      break;
  }
  console.log('Click!');
  console.log(target, targetClassList);
});*/

/*document
  .getElementById("messages-block")
  .addEventListener("click", function (event) {
    console.log(event.target.id);
    if (event.target.id === "icon-delete") {
      confirm("Do you want to delete this message?");
      const msg = this.messageList.get(id);
      //const id = document.getElementById("icon-delete").parentNode.parentNode.id;
      controller.removeMessage(id);
    }
    if (event.target.id === "icon-edit") {
      alert("icon-edit");
      console.log(document.getElementById("icon-edit").parentNode.parentNode);
      const id = document.getElementById("icon-edit").parentNode.parentNode.id;
      controller.editMessage(document.getElementById(id));
    }
  });*/


const btnRegistrationForm = document.getElementById('registration-form');
btnRegistrationForm.addEventListener('submit', controller.signUp);

const btnSignInHeader = document.getElementById("btn-sign-in");
btnSignInHeader.addEventListener('click', controller.moveToLoginPage);
const linkSignIn = document.getElementById("link-sign-in");
linkSignIn.addEventListener('click', controller.moveToLoginPage);

const btnSignOut = document.getElementById("btn-sign-out");
//btnSignOut.addEventListener('click', controller.returnToChatPage2);

const linkSignUp = document.getElementById("link-sign-up");
linkSignUp.addEventListener('click', controller.moveToRegistrationPage);

const linkBackToChat = document.getElementById("back-link-signin");
linkBackToChat.addEventListener('click', controller.returnToChatPage);
const linkBackToChat2 = document.getElementById("back-link-signup");
linkBackToChat2.addEventListener('click', controller.returnToChatPage);

// const btnEdit = document.getElementById("btn-edit");
// btnEdit.addEventListener('click', () => {controller.editMessage()});  


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