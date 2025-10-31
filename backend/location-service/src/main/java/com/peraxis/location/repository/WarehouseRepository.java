package com.peraxis.location.repository;

import com.peraxis.location.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByActiveTrue();
    
    List<Warehouse> findByCity(String city);
    
    List<Warehouse> findByState(String state);
    
    @Query(value = "SELECT *, " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * " +
           "cos(radians(longitude) - radians(:longitude)) + " +
           "sin(radians(:latitude)) * sin(radians(latitude)))) AS distance " +
           "FROM warehouses WHERE active = true " +
           "HAVING distance < :radiusKm " +
           "ORDER BY distance LIMIT :limit", nativeQuery = true)
    List<Warehouse> findNearbyWarehouses(@Param("latitude") Double latitude, 
                                       @Param("longitude") Double longitude, 
                                       @Param("radiusKm") Double radiusKm,
                                       @Param("limit") Integer limit);
}