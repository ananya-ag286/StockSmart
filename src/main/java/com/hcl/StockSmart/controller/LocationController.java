package com.hcl.StockSmart.controller;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import com.hcl.StockSmart.entity.Location;
import com.hcl.StockSmart.service.LocationService;

@RestController
@RequestMapping("/api/locations")
@Tag(name = "Locations", description = "Manage stores and warehouses used for multi-location inventory tracking")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @Operation(summary = "Create a new location", description = "Registers a new store or warehouse location")
    @ApiResponse(responseCode = "200", description = "Location created successfully")
    @PostMapping
    public Location createLocation(@RequestBody Location location) {
        return locationService.createLocation(location);
    }

    @Operation(summary = "Get all locations", description = "Returns a list of all registered locations")
    @ApiResponse(responseCode = "200", description = "Location list returned")
    @GetMapping
    public List<Location> getAllLocations() {
        return locationService.getAllLocations();
    }

    @Operation(summary = "Get location by ID", description = "Returns a single location record by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Location found"),
        @ApiResponse(responseCode = "404", description = "Location not found")
    })
    @GetMapping("/{id}")
    public Location getLocationById(@Parameter(description = "Location ID") @PathVariable Long id) {
        return locationService.getLocationById(id);
    }

    @Operation(summary = "Update a location", description = "Updates the details of an existing location")
    @ApiResponse(responseCode = "200", description = "Location updated successfully")
    @PutMapping("/{id}")
    public Location updateLocation(
            @Parameter(description = "Location ID") @PathVariable Long id,
            @RequestBody Location location) {
        return locationService.updateLocation(id, location);
    }

    @Operation(summary = "Delete a location", description = "Removes a location record by ID")
    @ApiResponse(responseCode = "200", description = "Location deleted successfully")
    @DeleteMapping("/{id}")
    public String deleteLocation(@Parameter(description = "Location ID") @PathVariable Long id) {
        locationService.deleteLocation(id);
        return "Location deleted successfully";
    }
}
