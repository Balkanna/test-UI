class Message {

  constructor(id, createdAt, author, text, to, isPersonal) {
    this._id = id,
    this._createdAt = createdAt ,
    this._author = author,
    this._text = text,
    this._to = to,
    this._isPersonal = isPersonal
  }

  get id() {    
    return this._id;
  }

  set id(id) {    
    throw new Error('Deny to edit object field')
  }

  get createdAt() {
    return this._createdAt;
  }

  set createdAt(value) {
    throw new Error('Deny to edit object field')
  }

  set text(value) {
    this._text = value.slice(0, 200);  
  }

  get author() {
    return this._author;
  }

  set author(value) {
    throw new Error('Deny to edit object field')
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
    this._user = 'Anna';
  }

  get user() {
    return this._user;
  }

  /*set user(user) {
    this._user = user;
  }*/
   
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
      return (item.author === this._user || ((item.isPersonal === true && item.to === this._user) || item.isPersonal === false));
    });
  
    Object.keys(filterConfig).forEach(key => {
      result = result.filter(item => filterObj[key](item, filterConfig[key]));
    });

    result = result.sort((a, b) => {
      return a.createdAt - b.createdAt;
    }); 

    return result.slice(skip, skip+top);
    //TODO: validate user
  };

  add(msg) {

    if (MessageList.validate(msg) && this._user === msg.author) {
      const {text, to, isPersonal} = msg;
      const id = Math.random().toString(36).substr(2, 10);
      const createdAt = new Date();
      const author = this._user;
      const newMessage = new Message(id, createdAt, author, text, to, isPersonal);
      this._messages.push(newMessage);
      return true; 
    }
    return false; 
  };

  static validate(msg){

    const validateObj = {
      text: (msg) => msg.text && typeof msg.text === "string" && msg.text.length <= 200,
    }

    if (msg.isPersonal) {
      if (typeof msg.isPersonal !== 'boolean' || (msg.isPersonal && !(msg.to && typeof msg.to === 'string' && msg.to.length > 0))) {
        return false;
      }
    }

    return Object.keys(validateObj).every(key => validateObj[key](msg));  
    
    //TODO нужно проверить, если isPersonal === true, что поле to тоже заполнено
  };

  edit(id, msg) {

    const editObj = {
      text: (item, text) => text ? item.text = text : item.text,
      to: (item, to) => to ? item.to = to : item,
    };

    const msgIndex = this._messages.findIndex((msg) => msg.id === id);
    const copyObj = Object.assign({}, this._messages[msgIndex]);

    Object.keys(editObj).forEach(key => editObj[key](copyObj, msg[key]));
    
    if (msgIndex !== -1 && this._messages[msgIndex].author === this._user) {
      if (MessageList.validate(copyObj)) {
        this._messages[msgIndex] = copyObj;
        return true;
      }
    }
    return false;
  };

  remove(id) {

    let index = this._messages.findIndex(item => item.id === id);

    if (this._messages[index].author === this._user && index !== -1 ) {
      this._messages.splice(index, 1);
      return true;
    }
    return false;
  } 

  addAll(messages) {

    let invalidMessages = [];
    messages.forEach(msg => {
      if (MessageList.validate(msg)) {
        this._messages.push(msg);
      }
      else {
        invalidMessages.push(msg);
      }
    });
    return invalidMessages;
  }

  clear() {
    this._messages = [];
  }
}

const messages = [
  { 
    id: '1',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:00'),
    author: 'Tom',
    isPersonal: false
  },
  {
    id: '2',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:05'),
    author: 'Tom',
    isPersonal: false
  },
  {
    id: '3',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:00:07'),
    author: 'Anna',
    isPersonal: false
  },
  {
    id: '4',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:01:00'),
    author: 'Elon',
    isPersonal: false
  },
  {
    id: '5',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:01:08'),
    author: 'Tom',
    isPersonal: false
  },
  {
    id: '6',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:02:00'),
    author: 'Anna',
    isPersonal: false
  },
  {
    id: '7',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:05:00'),
    author: 'Tom',
    isPersonal: false
  },
  {
    id: '8',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:05:02'),
    author: 'Alice',
    isPersonal: false
  },
  {
    id: '9',
    text: 'Lorem lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T20:07:03'),
    author: 'Tom',
    isPersonal: false
  },
  {
    id: '10',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:00:00'),
    author: 'Anna',
    isPersonal: false
  },
  {
    id: '11',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:05:00'),
    author: 'Elon',
    isPersonal: false
  },
  {
    id: '12',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:05:10'),
    author: 'Maxim',
    isPersonal: false
  },
  {
    id: '13',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:06:00'),
    author: 'Alice',
    isPersonal: true,
    to: 'Anna'
  },
  {
    id: '14',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T21:07:01'),
    author: 'Anna',
    isPersonal: true,
    to: 'Alice'
  },
  {
    id: '15',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:04:09'),
    author: 'Anna',
    isPersonal: true,
    to: 'Alice'
  },
  {
    id: '16',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:05:00'),
    author: 'Alice',
    isPersonal: true,
    to: 'Anna'
  },
  {
    id: '17',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:08:07'),
    author: 'Alice',
    isPersonal: true,
    to: 'Anna'
  },
  {
    id: '18',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:00'),
    author: 'Anna',
    isPersonal: true,
    to: 'Alice'
  },
  {
    id: '19',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:03'),
    author: 'Elon',
    isPersonal: false
  },
  {
    id: '20',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date('2020-10-12T22:09:07'),
    author: 'Alexander',
    isPersonal: false
  }
]

const messageList = new MessageList(messages);
console.log('Msgs collections: ', messageList);

console.log('Get message id = 3: ', messageList.get('3'));

console.log('Get 10 messages: ', messageList.getPage(0,10));
console.log('Get 20 messages: ', messageList.getPage(0,20));

console.log('Get messages of users with name "Tom": ', messageList.getPage(0, 10, {author: 'Tom'}));
console.log('Get messages of users with "Tom" substr in author and "Lorem lorem" in text: ', messageList.getPage(0, 20, {
	author: 'Tom',
  text: 'Lorem lorem',
  //dateFrom: new Date('2020-10-12T20:01:00'),
  //dateTo: new Date('2020-10-12T20:01:00')
}));

console.log('Add the message, where author = user: ', messageList.add(newMessage = {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  author: 'Anna',
  isPersonal: true,
  to: 'Alice'
}));
console.log('Msg example, where author = user: ', newMessage);
console.log('Msgs collections after adding the valid message, where author = user: ', messageList);

console.log('Add the message, where author != user: ',messageList.add(newMessage = {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  author: 'Elon',
  isPersonal: true,
  to: 'Max'
}));
console.log('Msg example, where author != user: ', newMessage);
console.log('Msgs collections after adding the valid message, where author != user: ', messageList);

console.log('Msg example, where text > 200 words: ', message = {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  createdAt: new Date('2020-10-12T20:00:00'),
  author: 'Tom',
  isPersonal: false
});
console.log('Add the invalid message (>200 words): ', messageList.add(message = {
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  createdAt: new Date('2020-10-12T20:00:00'),
  author: 'Tom',
  isPersonal: false
}));
console.log('Msgs collections after adding the invalid message (>200 words): ', messageList);

console.log('Check valid message:', MessageList.validate(newMessage));
console.log('Check invalid message:', MessageList.validate(message));
console.log('Edit message, where author = user:', messageList.edit('15', {text:'I changed!'}));
console.log('Edit message, where author != user:', messageList.edit('4', {text:'Hello World!'}));
console.log('Msgs collections after editing: ', messageList);

console.log('Remove message id = 1, where author != user:', messageList.remove('1'));
console.log('Remove message id = 3, where author = user:', messageList.remove('3'));
console.log('Msgs collections after removing: ', messageList);

console.log('Add all:', messageList.addAll(messages));
console.log('Msgs collections: ', messageList);
/*messageList.addAll([new Message('bla-bla', {
  text: 'Всем привет.',
  isPersonal: false
}),
new Message('bla-bla', {
  text: 'Всем привет.',
  isPersonal: false
}),
new Message('bla-bla', {
  text: 'Всем привет.',
  isPersonal: false
})]);*/

/*console.log(messageList.clear(messages));
console.log( 'Msgs collections after clearing: ', messageList);*/