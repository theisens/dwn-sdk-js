import type { MessagesGetMessage } from '../../../../src/index.js';

import { expect } from 'chai';
import { Jws } from '../../../../src/index.js';
import { Message } from '../../../../src/core/message.js';
import { MessagesGet } from '../../../../src/index.js';
import { TestDataGenerator } from '../../../utils/test-data-generator.js';

describe('MessagesGet Message', () => {
  describe('create', () => {
    it('creates a MessagesGet message', async () => {
      const { requester, message } = await TestDataGenerator.generateRecordsWrite();
      const messageCid = await Message.getCid(message);

      const messagesGet = await MessagesGet.create({
        authorizationSignatureInput : await Jws.createSignatureInput(requester),
        messageCids                 : [messageCid]
      });

      expect(messagesGet.message.authorization).to.exist;
      expect(messagesGet.message.descriptor).to.exist;
      expect(messagesGet.message.descriptor.messageCids.length).to.equal(1);
      expect(messagesGet.message.descriptor.messageCids).to.include(messageCid);
    });


    it('throws an error if at least 1 message cid isnt provided', async () => {
      const alice = await TestDataGenerator.generatePersona();

      try {
        await MessagesGet.create({
          authorizationSignatureInput : await Jws.createSignatureInput(alice),
          messageCids                 : []
        });

        expect.fail();
      } catch (e: any) {
        // error message auto-generated by AJV
        expect(e.message).to.include('/descriptor/messageCids: must NOT have fewer than 1 items');
      }
    });

    it('throws an error if an invalid CID is provided', async () => {
      const alice = await TestDataGenerator.generatePersona();

      try {
        await MessagesGet.create({
          authorizationSignatureInput : await Jws.createSignatureInput(alice),
          messageCids                 : ['abcd']
        });

        expect.fail();
      } catch (e: any) {
        expect(e.message).to.include('is not a valid CID');
      }
    });
  });

  describe('parse', () => {
    it('parses a message into a MessagesGet instance', async () => {
      const { requester, message } = await TestDataGenerator.generateRecordsWrite();
      let messageCid = await Message.getCid(message);

      const messagesGet = await MessagesGet.create({
        authorizationSignatureInput : await Jws.createSignatureInput(requester),
        messageCids                 : [messageCid]
      });

      const parsed = await MessagesGet.parse(messagesGet.message);
      expect(parsed).to.be.instanceof(MessagesGet);

      const expectedMessageCid = await Message.getCid(messagesGet.message);
      messageCid = await Message.getCid(parsed.message);

      expect(messageCid).to.equal(expectedMessageCid);
    });

    it('throws an exception if messageCids contains an invalid cid', async () => {
      const { requester, message: recordsWriteMessage } = await TestDataGenerator.generateRecordsWrite();
      const messageCid = await Message.getCid(recordsWriteMessage);

      const messagesGet = await MessagesGet.create({
        authorizationSignatureInput : await Jws.createSignatureInput(requester),
        messageCids                 : [messageCid]
      });

      const message = messagesGet.toJSON() as MessagesGetMessage;
      message.descriptor.messageCids = ['abcd'];

      try {
        await MessagesGet.parse(message);

        expect.fail();
      } catch (e: any) {
        expect(e.message).to.include('is not a valid CID');
      }
    });
  });
});