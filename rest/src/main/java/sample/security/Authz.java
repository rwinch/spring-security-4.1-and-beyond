package sample.security;

import org.springframework.stereotype.Component;

import sample.data.Message;
import sample.data.User;

@Component
public class Authz {

	public boolean check(Long userId, User user) {
		return userId.equals(user.getId());
	}

	public boolean check(Message message, User user) {
		if(message == null) {
			return true;
		}
		if(user == null) {
			return false;
		}
		return check(message.getTo().getId(), user) || check(message.getFrom().getId(), user);
	}
}
