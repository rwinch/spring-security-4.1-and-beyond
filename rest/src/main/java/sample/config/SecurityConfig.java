/*
 * Copyright 2012-2016 the original author or authors.
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
package sample.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author Rob Winch
 * @author Joe Grandja
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	// @formatter:off
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		HttpStatusEntryPoint xhrLoginHandler = new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED);
		RequestHeaderRequestMatcher xhrLoginRequestMatcher
				= new RequestHeaderRequestMatcher("X-Requested-With", "XMLHttpRequest");

		XhrAuthenticationHandler xhrAuthenticationHandler = new XhrAuthenticationHandler();

		http
			.csrf()
				.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.and()
			.authorizeRequests()
				.antMatchers("/", "/assets/**", "/webjars/**").permitAll()
				.anyRequest().authenticated()
				.and()
			.formLogin()
				.permitAll()
				.successHandler(xhrAuthenticationHandler)
				.failureHandler(xhrAuthenticationHandler)
				.and()
			.exceptionHandling()
				.defaultAuthenticationEntryPointFor(xhrLoginHandler, xhrLoginRequestMatcher)
				.and()
			.httpBasic()
				.and()
			.headers()
				.contentSecurityPolicy("default-src 'self' " +
						"https://ajax.googleapis.com " +
						"https://cdnjs.cloudflare.com; " +
						"style-src 'self' 'unsafe-inline'");
	}
	// @formatter:on

	private static class XhrAuthenticationHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {
		@Override
		public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
											Authentication authentication) throws IOException, ServletException {
			response.setStatus(HttpStatus.NO_CONTENT.value());
		}
		@Override
		public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
											AuthenticationException exception) throws IOException, ServletException {
			response.setStatus(HttpStatus.UNAUTHORIZED.value());
		}
	}
}