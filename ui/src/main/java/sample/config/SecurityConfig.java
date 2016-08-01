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

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;

/**
 * @author Rob Winch
 * @author Joe Grandja
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		HttpStatusReturningLogoutSuccessHandler logoutSuccessHandler
				= new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK);
		RequestHeaderRequestMatcher logoutSuccessRequestMatcher
				= new RequestHeaderRequestMatcher("X-Requested-With", "XMLHttpRequest");

		http
				.authorizeRequests()
					.antMatchers("/assets/**", "/webjars/**", "/custom-login").permitAll()
					.anyRequest().authenticated().and()
				.httpBasic().and()
				.formLogin()
					.loginPage("/custom-login").permitAll()
					.failureUrl("/login-error").and()
				.logout()
					.defaultLogoutSuccessHandlerFor(
							logoutSuccessHandler, logoutSuccessRequestMatcher).and()
				.csrf()
					.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()).and()
				.headers()
					.contentSecurityPolicy("script-src 'self' ajax.googleapis.com cdnjs.cloudflare.com");

	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

}