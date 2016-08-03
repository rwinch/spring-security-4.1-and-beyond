package sample.security;

import org.springframework.stereotype.Component;

import sample.data.User;

@Component
public class Authz {

	public boolean check(Long userId, User user) {
		return userId.equals(user.getId());
	}
}
