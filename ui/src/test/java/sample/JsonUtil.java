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
package sample;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

/**
 * @author Joe Grandja
 */
public final class JsonUtil {
	private static ObjectMapper objectMapper = new ObjectMapper();

	private JsonUtil() {
	}

	public static <T> T readValue(String content, TypeReference<T> typeReference) throws IOException {
		T value = objectMapper.readValue(content, typeReference);
		return value;
	}

	public static <T> T readValue(String content, Class<T> valueType) throws IOException {
		T value = objectMapper.readValue(content, valueType);
		return value;
	}

	public static String writeValue(Object value) throws IOException {
		String valueStr = objectMapper.writeValueAsString(value);
		return valueStr;
	}
}