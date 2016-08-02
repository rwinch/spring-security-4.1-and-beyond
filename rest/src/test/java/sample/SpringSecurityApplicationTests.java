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

import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.web.client.MockMvcClientHttpRequestFactory;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import sample.data.Message;
import sample.data.User;

import javax.servlet.http.Cookie;
import java.util.Calendar;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


/**
 *
 * @author Rob Winch
 * @author Joe Grandja
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = RestApplication.class)
@AutoConfigureMockMvc
@Transactional
@WithMockUser
public class SpringSecurityApplicationTests {
	@Autowired
	MockMvc mockMvc;

	@Test
	@WithAnonymousUser
	public void accessHomeUnauthenticatedRedirectsToFormLogin() throws Exception {
		mockMvc.perform(get("/").accept(MediaType.TEXT_HTML))
				.andExpect(status().is3xxRedirection())
				.andExpect(redirectedUrlPattern("**/*login"));
	}

	/*
		Angular Cross Site Request Forgery (XSRF) Protection
		https://docs.angularjs.org/api/ng/service/$http
	 */
	@Test
	public void deleteJoesMessage_SimulateAngular() throws Exception {
		MvcResult mvcResult = mockMvc.perform(get("/messages/inbox")
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		List<Message> messages = JsonUtil.readValue(
				mvcResult.getResponse().getContentAsString(), new TypeReference<List<Message>>(){});

		Cookie[] cookies = mvcResult.getResponse().getCookies();
		String csrfToken = extractCsrfToken(cookies);

		mockMvc.perform(delete("/messages/{id}", messages.get(0).getId())
				.header("X-Requested-With", "XMLHttpRequest")
				.header("X-XSRF-TOKEN", csrfToken)
				.cookie(cookies))
				.andExpect(status().isOk());
	}

	private String extractCsrfToken(Cookie... cookies) {
		String csrfToken = "";
		for (Cookie cookie : cookies) {
			if ("XSRF-TOKEN".equals(cookie.getName())) {
				return cookie.getValue();
			}
		}
		return csrfToken;
	}

	@Test
	@WithAnonymousUser
	public void securityEnabled() throws Exception {
		mockMvc
				.perform(get("/").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isUnauthorized());
	}

	@Test
	public void deleteJoesMessage() throws Exception {
		mockMvc.perform(delete("/messages/{id}", 110L)
				.with(csrf())
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

		List<Message> messages = JsonUtil.readValue(json, new TypeReference<List<Message>>(){});
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

		List<Message> messages = JsonUtil.readValue(json, new TypeReference<List<Message>>(){});
		assertThat(messages).isNotEmpty();

		assertThat(messages).extracting(m-> m.getSummary()).containsOnly("Hello Rob","How are you Rob?", "Is this secure?");
	}

	@Test
	public void getMessage() throws Exception {
		MvcResult result = mockMvc.perform(get("/messages/{id}", 111L)
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		String json = result.getResponse().getContentAsString();

		Message message = JsonUtil.readValue(json, new TypeReference<Message>(){});

		assertThat(message.getSummary()).isEqualTo("Greetings Joe");
	}

	@Test
	public void getUsers() throws Exception {
		MvcResult result = mockMvc.perform(get("/users")
				.header("X-Requested-With", "XMLHttpRequest"))
				.andExpect(status().isOk())
				.andReturn();

		String json = result.getResponse().getContentAsString();

		List<User> messages = JsonUtil.readValue(json, new TypeReference<List<User>>(){});
		assertThat(messages.size()).isEqualTo(3);

		assertThat(messages).extracting(m-> m.getEmail()).containsOnly("rob@example.com","joe@example.com", "eve@example.com");
	}

	@Test
	public void save() throws Exception {
		RestTemplate rest = new RestTemplate(new MockMvcClientHttpRequestFactory(mockMvc));

		Message toCreate = toCreate();

		HttpEntity<Message> entity = new HttpEntity<>(toCreate);

		ResponseEntity<Message> result = rest.exchange("/messages", HttpMethod.POST, entity, new ParameterizedTypeReference<Message>() {});

		assertThat(result.getStatusCode().is2xxSuccessful()).isTrue();
	}

	@Test(expected = HttpClientErrorException.class)
	public void saveValidationFails() throws Exception {
		RestTemplate rest = new RestTemplate(new MockMvcClientHttpRequestFactory(mockMvc));

		Message toCreate = toCreate();
		toCreate.setSummary(null);

		HttpEntity<Message> entity = new HttpEntity<>(toCreate);

		rest.exchange("/messages", HttpMethod.POST, entity, new ParameterizedTypeReference<Message>() {});
	}

	private Message toCreate() {
		Message toCreate = new Message();
		toCreate.setCreated(Calendar.getInstance());
		toCreate.setSummary("This is a test..");
		toCreate.setText("of the emergency broadcast system");
		toCreate.setTo(rob());
		return toCreate;
	}

	public static User rob() {
		User user = new User();
		user.setEmail("rob@example.com");
		user.setFirstName("Rob");
		user.setLastName("Winch");
		user.setId(0L);
		return user;
	}
}