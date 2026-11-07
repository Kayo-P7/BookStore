package br.com.bookstore.customer.security;

import br.com.bookstore.customer.model.Customer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

// adaptador que mapeia a entidade customer para a interface userdetails do spring security
public class CustomerUserDetails implements UserDetails {

    private final Customer customer;
    private final List<GrantedAuthority> authorities;

    public CustomerUserDetails(Customer customer) {
        this.customer = customer;
        String role = customer.getRole() != null ? customer.getRole() : "ROLE_CUSTOMER";
        String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(normalizedRole));
    }

    public Customer getCustomer() {
        return customer;
    }

    public Long getId() {
        return customer.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return customer.getPassword();
    }

    @Override
    public String getUsername() {
        return customer.getEmail();
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
        return true;
    }
}
