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
package sample.data;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PostAuthorize;

/**
 * Manages {@link Message} instances
 *
 * @author Rob Winch
 *
 */
public interface MessageRepository extends CrudRepository<Message, Long> {

	@Query("select m from Message m where m.to.id = 1") //?#{principal.id}
	Iterable<Message> inbox();

	@Query("select m from Message m where m.from.id = 1") //?#{principal.id}
	Iterable<Message> sent();

	//@PostAuthorize("returnObject?.to?.id == principal.id || returnObject?.from?.id == principal.id")
	Message findOne(@Param("id") Long id);

	Message findBySummary(@Param("summary") String summary);

	<S extends Message> S save(S message);

	void delete(Long id);
}
