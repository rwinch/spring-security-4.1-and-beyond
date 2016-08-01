package sample.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import sample.data.Message;
import sample.data.MessageRepository;
import sample.data.User;

@Component("authz")
public class Authz {
	@Autowired
	MessageRepository messages;

	public boolean check(User user, Long id) {
		if (user == null) {
			return false;
		}
		Message m = messages.findOne(id);
		return check(user, m);
	}

	public boolean check(User user, Message m) {
		if (user == null) {
			return false;
		}
		if (m == null) {
			return true;
		}
		return user.getId().equals(m.getTo().getId()) || user.getId().equals(m.getFrom().getId());
	}

	public boolean check(String anonymous, Long id) {
		return false;
	}
}
