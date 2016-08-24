/*
 * Copyright 2002-2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package sample.mvc;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import sample.data.Message;
import sample.data.MessageRepository;
import sample.data.User;
import sample.data.UserRepository;
import sample.security.CurrentUser;
import sample.security.MockCurrentUser;

/**
 * Controller for managing {@link Message} instances.
 *
 * @author Rob Winch
 * @author Joe Grandja
 *
 */
@CrossOrigin
@RestController
@RequestMapping(value = "/messages")
public class MessageController {

	private final MessageRepository messageRepository;
	private final UserRepository userRepository;

	@Autowired
	public MessageController(MessageRepository messageRepository, UserRepository userRepository) {
		this.messageRepository = messageRepository;
		this.userRepository = userRepository;
	}

	@RequestMapping(value = "/inbox")
	public Iterable<Message> inbox() {
		return messageRepository.inbox();
	}

	@RequestMapping(value = "/sent")
	public Iterable<Message> sent() {
		return messageRepository.sent();
	}

	@RequestMapping(value = "/{id}")
	public Message get(@PathVariable Long id) {
		return messageRepository.findOne(id);
	}

	@RequestMapping(method = RequestMethod.POST)
	public Message save(@Valid @RequestBody Message message) {
		User currentUser = MockCurrentUser.currentUser();
		message.setTo(userRepository.findByEmail(message.getTo().getEmail()));
		message.setFrom(userRepository.findByEmail(currentUser.getEmail()));
		message = messageRepository.save(message);

		return message;
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	public void delete(@PathVariable Long id) {
		messageRepository.delete(id);
	}

}