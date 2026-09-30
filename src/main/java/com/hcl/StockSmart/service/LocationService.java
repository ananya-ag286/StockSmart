package com.hcl.StockSmart.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hcl.StockSmart.entity.Location;
import com.hcl.StockSmart.repository.LocationRepository;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
    }

    public Location updateLocation(Long id, Location updatedLocation) {
        Location existingLocation = getLocationById(id);

        existingLocation.setName(updatedLocation.getName());
        existingLocation.setType(updatedLocation.getType());
        existingLocation.setAddress(updatedLocation.getAddress());

        return locationRepository.save(existingLocation);
    }

    public void deleteLocation(Long id) {
        Location location = getLocationById(id);
        locationRepository.delete(location);
    }
}