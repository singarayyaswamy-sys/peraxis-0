package com.peraxis.location.repository;

import com.peraxis.location.model.ServiceableZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ServiceableZoneRepository extends JpaRepository<ServiceableZone, Long> {
    Optional<ServiceableZone> findByPincode(String pincode);
    
    List<ServiceableZone> findByServiceableTrue();
    
    @Query("SELECT sz FROM ServiceableZone sz WHERE sz.city = :city AND sz.serviceable = true")
    List<ServiceableZone> findServiceableByCity(@Param("city") String city);
    
    @Query("SELECT sz FROM ServiceableZone sz WHERE sz.state = :state AND sz.serviceable = true")
    List<ServiceableZone> findServiceableByState(@Param("state") String state);
}