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
package sample.session;

import java.util.Arrays;
import java.util.Collections;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.session.Session;
import org.springframework.session.web.http.CookieHttpSessionStrategy;
import org.springframework.session.web.http.HeaderHttpSessionStrategy;
import org.springframework.session.web.http.HttpSessionStrategy;
import org.springframework.stereotype.Component;
import org.springframework.web.accept.ContentNegotiationStrategy;

@Component
public class SmartHttpSessionStrategy implements HttpSessionStrategy {
	private HttpSessionStrategy browser;

	private HttpSessionStrategy api;

	private RequestMatcher browserMatcher;

	@Autowired
	public SmartHttpSessionStrategy(ContentNegotiationStrategy contentNegotiationStrategy) {
		this(new CookieHttpSessionStrategy(), new HeaderHttpSessionStrategy());
		MediaTypeRequestMatcher matcher = new MediaTypeRequestMatcher(contentNegotiationStrategy,
				Arrays.asList(MediaType.TEXT_HTML));
		matcher.setIgnoredMediaTypes(Collections.singleton(MediaType.ALL));

		RequestHeaderRequestMatcher javascript = new RequestHeaderRequestMatcher("X-Requested-With");

		this.browserMatcher = new OrRequestMatcher(Arrays.asList(matcher, javascript));
	}

	public SmartHttpSessionStrategy(HttpSessionStrategy browser, HttpSessionStrategy api) {
		this.browser = browser;
		this.api = api;
	}

	@Override
	public String getRequestedSessionId(HttpServletRequest request) {
		return getStrategy(request).getRequestedSessionId(request);
	}

	@Override
	public void onNewSession(Session session, HttpServletRequest request, HttpServletResponse response) {
		getStrategy(request).onNewSession(session, request, response);
	}

	@Override
	public void onInvalidateSession(HttpServletRequest request, HttpServletResponse response) {
		getStrategy(request).onInvalidateSession(request, response);
	}

	private HttpSessionStrategy getStrategy(HttpServletRequest request) {
		return this.browserMatcher.matches(request) ? this.browser : this.api;
	}
}