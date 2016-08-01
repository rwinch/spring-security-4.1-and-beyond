/*
 * Copyright 2002-2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package sample;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Calendar;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.client.MockMvcClientHttpRequestFactory;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;

import sample.mvc.model.MessageDto;
import sample.mvc.model.UserDto;

/**
 *
 * @author Rob Winch
 * @author Joe Grandja
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = RestApplication.class)
@AutoConfigureMockMvc
public class SpringSecurityApplicationTests {
	@Autowired
	MockMvc mockMvc;

	@Test
	public void deleteJoesMessage() throws Exception {
		mockMvc.perform(delete("/messages/{id}", 110L)
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk());
	}

	@Test
	public void getJoesInbox() throws Exception {
		MvcResult result = mockMvc.perform(get("/messages/inbox")
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		String json = result.getResponse().getContentAsString();

		List<MessageDto> messages = JsonUtil.readValue(json, new TypeReference<List<MessageDto>>(){});
		assertThat(messages.size()).isEqualTo(3);

		assertThat(messages).extracting(m-> m.getSummary()).containsOnly("Hello Joe","Greetings Joe", "Is this secure?");
	}

	@Test
	public void getJoesSent() throws Exception {
		MvcResult result = mockMvc.perform(get("/messages/sent")
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		String json = result.getResponse().getContentAsString();

		List<MessageDto> messages = JsonUtil.readValue(json, new TypeReference<List<MessageDto>>(){});
		assertThat(messages.size()).isEqualTo(3);

		assertThat(messages).extracting(m-> m.getSummary()).containsOnly("Hello Rob","How are you Rob?", "Is this secure?");
	}

	@Test
	public void getMessage() throws Exception {
		MvcResult result = mockMvc.perform(get("/messages/{id}", 111L)
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		String json = result.getResponse().getContentAsString();

		MessageDto message = JsonUtil.readValue(json, new TypeReference<MessageDto>(){});

		assertThat(message.getSummary()).isEqualTo("Greetings Joe");
	}

	@Test
	public void getUsers() throws Exception {
		MvcResult result = mockMvc.perform(get("/users")
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		String json = result.getResponse().getContentAsString();

		List<UserDto> messages = JsonUtil.readValue(json, new TypeReference<List<UserDto>>(){});
		assertThat(messages.size()).isEqualTo(3);

		assertThat(messages).extracting(m-> m.getEmail()).containsOnly("rob@example.com","joe@example.com", "eve@example.com");
	}

	@Test
	public void save() throws Exception {
		RestTemplate rest = new RestTemplate(new MockMvcClientHttpRequestFactory(mockMvc));

		MessageDto toCreate = toCreate();

		HttpEntity<MessageDto> entity = new HttpEntity<>(toCreate);

		ResponseEntity<MessageDto> result = rest.exchange("/messages", HttpMethod.POST, entity, new ParameterizedTypeReference<MessageDto>() {});

		assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
	}

	@Test(expected = HttpClientErrorException.class)
	public void saveValidationFails() throws Exception {
		RestTemplate rest = new RestTemplate(new MockMvcClientHttpRequestFactory(mockMvc));

		MessageDto toCreate = toCreate();
		toCreate.setSummary(null);

		HttpEntity<MessageDto> entity = new HttpEntity<>(toCreate);

		rest.exchange("/messages", HttpMethod.POST, entity, new ParameterizedTypeReference<MessageDto>() {});
	}

	private MessageDto toCreate() {
		MessageDto toCreate = new MessageDto();
		toCreate.setCreated(Calendar.getInstance());
		toCreate.setSummary("This is a test..");
		toCreate.setText("of the emergency broadcast system");
		toCreate.setToUser(rob());
		return toCreate;
	}

	public static UserDto rob() {
		UserDto user = new UserDto();
		user.setEmail("rob@example.com");
		user.setFirstName("Rob");
		user.setLastName("Winch");
		user.setId(0L);
		return user;
	}
}