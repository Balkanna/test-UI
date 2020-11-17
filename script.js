//let curAuthor = 'Anna';

class Message {
  constructor(id, createdAt, author, text, to, isPersonal) {
    this._id = id /*this.generateId()*/,
    this._createdAt = createdAt /*new Date()*/,
    this._author = author,
    this._text = text,
    this._to = to,
    this._isPersonal = isPersonal
  }

  generateId(){
    return Math.random().toString(36).substr(2, 10);
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
    //user here or get/set !
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

  getFilterObj() {
    return {
      text: (item, text) => text && item.text.toLowerCase().includes(text.toLowerCase()),
      author: (item, author) => author && item.author.toLowerCase().includes(author.toLowerCase()),
      dateTo: (item, dateTo) => dateTo && item.createdAt < dateTo,
      dateFrom: (item, dateFrom) => dateFrom && item.createdAt > dateFrom
    }
  };

  getPage(skip = 0, top = 10, filterConfig = {}) {
    let result = this._messages.slice().filter(item => {
      return (item.author === this._user || ((item.isPersonal === true && item.to === this._user) || item.isPersonal === false));
    });
    const messageFilter = this.getFilterObj();
    // Filtering
    Object.keys(filterConfig).forEach(key => {
      result = result.filter(item => messageFilter[key](item, filterConfig[key]));
    });

    // Sorting
    result = result.sort((a, b) => {
      return a.createdAt - b.createdAt;
    }); 

    return result.slice(skip, skip+top);
    //TODO: validate user
  };

  getValidateObj() {
    return {
      id: (item) => item.id && typeof item.id === "string",
      text: (item) => item.text && typeof item.text === "string" && item.text.length <= 200,
      author: (item) => item.author && typeof item.author === "string",
      createdAt: (item) => item.createdAt
    };
  }

  add(msg) {
    if (this.validate(msg)) {
      //TODO
      /*msg._id = `${+new Date()}`;
      msg._author = author;
      msg._createdAt = new Date();
      msg.author = this._user;*/
      this._messages.push(msg);
      return true; 
    }
    return false; 
  };

  validate(msg){
    const messageValidator = this.getValidateObj();

    if (msg.isPersonal) {
      if (typeof msg.isPersonal !== 'boolean' || (msg.isPersonal && !(msg.to && typeof msg.to === 'string' && msg.to.length > 0))) {
        return false;
      }
    }

    return Object.keys(messageValidator).every(key => messageValidator[key](msg));  
    
    //TODO нужно проверить, если isPersonal === true, что поле to тоже заполнено
  };

  edit(id, msg) {
    const editObj = {
      text: (item, text) => text ? item.text = text : item.text,
      to: (item, to) => to ? item.to = to : item,
    };

    const msgIndex = this._messages.findIndex((msg) => msg._id === id);
    const copyObj = Object.assign({}, this._messages[msgIndex]);

    Object.keys(editObj).forEach(key => editObj[key](copyObj, msg[key]));
    
    if (this.validate(copyObj)) {
      //TODO USER VALIDATE
      this._messages[msgIndex] = copyObj;
      return true;
    }
    return false;
  };

  /*edit(id, msg) {
    let editedItem = this._messages.find(item => {
      return item.id === id;
    });

    if (this.validate(msg) && editedItem.author === this._user) {
      Object.keys(msg).forEach(key=>{
        editedItem[key] = msg[key];
        return editedItem;
      });
      return editedItem;
    }
    return false;
  }*/

  remove(id) {
    //TODO USER VALIDATE
    const index = this._messages.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    this._messages.splice(index, 1);
    return true;
  };

  addAll(messages) {
    let invalidMessages = [];
    messages.forEach(msg => {
      if (this.validate(msg)) {
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
    text: 'Lorem lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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

console.log('Get messages: ', messageList.getPage(0,10));

console.log('Get messages of users with name "Tom": ', messageList.getPage(0, 10, {author: 'Tom'}));
console.log('Get messages of users with "Elon" substr in author and "Lorem lorem" in text: ', messageList.getPage(0, 20, {
	author: 'Elon',
  text: 'Lorem lorem',
  dateFrom: new Date('2020-10-12T20:01:00'),
  dateTo: new Date('2020-10-12T20:01:00')
}));

const message1 = {
  id: '21',
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  createdAt: new Date('2020-10-12T20:00:00'),
  author: 'Anna',
  isPersonal: false
};
messageList.add(message1);
console.log( 'Msgs collections after adding the valid message: ', messageList);
console.log('Msg example: ', message1);

const message2 = {
  id: '22',
  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  createdAt: new Date('2020-10-12T20:00:00'),
  author: 'Tom',
  isPersonal: false
};
console.log(messageList.add(message2));
console.log('Msg example: ', message2);
console.log('Msgs collections after adding the invalid message (>200 words): ', messageList);
//console.log(invalidMessages);


console.log('Check valid message:', messageList.validate(message1));
console.log('Check invalid message:', messageList.validate(message2));
/*messageList.edit('21', {text:'Hello!'});
console.log('Msgs collections after edit: ', messageList);*/

console.log('Remove message id = 1:', messageList.remove('1'));
console.log('Msgs collections after remove: ', messageList);

/*console.log('Add all:', messageList.addAll(messages));*/
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