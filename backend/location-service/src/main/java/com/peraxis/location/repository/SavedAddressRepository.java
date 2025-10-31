package com.peraxis.location.repository;

import com.peraxis.location.model.SavedAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedAddressRepository extends JpaRepository<SavedAddress, Long> {
    List<SavedAddress> findByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}