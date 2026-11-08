package br.com.bookstore.customer.security;

import br.com.bookstore.customer.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

// adaptador que mapeia a entidade user do sistema para a interface userdetails do spring security
public class SystemUserDetails implements UserDetails {

    private final User user;
    private final List<GrantedAuthority> authorities;

    public SystemUserDetails(User user) {
        this.user = user;
        String role = user.getRole() != null ? user.getRole() : "ROLE_SELLER";
        String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(normalizedRole));
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
}
