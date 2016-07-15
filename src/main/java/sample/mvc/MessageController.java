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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import sample.data.Message;
import sample.data.MessageRepository;
import sample.data.User;
import sample.data.UserRepository;
import sample.mvc.model.MessageDto;
import sample.mvc.model.UserDto;
import sample.security.CurrentUser;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for managing {@link Message} instances.
 *
 * @author Rob Winch
 * @author Joe Grandja
 *
 */
@RestController
@RequestMapping(value = "/messages")
public class MessageController {

	private final MessageRepository messageRepository;
	private final UserRepository userRepository;
	private final JsonMessageParser messageParser;

	@Autowired
	public MessageController(MessageRepository messageRepository, UserRepository userRepository, JsonMessageParser messageParser) {
		this.messageRepository = messageRepository;
		this.userRepository = userRepository;
		this.messageParser = messageParser;
	}

	@RequestMapping(value = "/inbox")
	public List<MessageDto> inbox() {
		return convert(messageRepository.inbox());
	}

	@RequestMapping(value = "/sent")
	public List<MessageDto> sent() {
		return convert(messageRepository.sent());
	}

	@RequestMapping(value = "/{id}")
	public MessageDto get(@PathVariable Long id) {
		return convert(messageRepository.findOne(id));
	}

	@RequestMapping(method = RequestMethod.POST)
	public MessageDto save(@RequestBody MessageDto messageDto, @CurrentUser User currentUser) {
		Message message = new Message();
		message.setSummary(messageDto.getSummary());
		message.setText(messageDto.getText());
		message.setTo(userRepository.findByEmail(messageDto.getToUser().getEmail()));
		message.setFrom(userRepository.findByEmail(currentUser.getEmail()));
		message = messageRepository.save(message);

		return convert(message);
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	public void delete(@PathVariable Long id) {
		messageRepository.delete(id);
	}

	private List<MessageDto> convert(Iterable<Message> messages) {
		List<MessageDto> messageDtos = new ArrayList<MessageDto>();
		for (Message message : messages) {
			messageDtos.add(convert(message));
		}

		return messageDtos;
	}

	private MessageDto convert(Message message) {
		MessageDto messageDto = new MessageDto();
		messageDto.setId(message.getId());
		messageDto.setSummary(message.getSummary());
		messageDto.setText(message.getText());
		messageDto.setCreated(message.getCreated());
		messageDto.setToUser(convert(message.getTo()));

		return messageDto;

	}

	private UserDto convert(User user) {
		UserDto userDto = new UserDto();
		userDto.setId(user.getId());
		userDto.setLastName(user.getLastName());
		userDto.setFirstName(user.getFirstName());
		userDto.setEmail(user.getEmail());

		return userDto;
	}
}