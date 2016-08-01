package sample.security;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import org.springframework.security.access.prepost.PostAuthorize;

@Retention(RetentionPolicy.RUNTIME)
@PostAuthorize("authenticated && @authz.check(principal, returnObject)")
public @interface ReadableMessage {

}
