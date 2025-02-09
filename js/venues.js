class VenueManager {
    constructor() {
        this.searchButton = document.getElementById('search-venues');
        this.locationInput = document.getElementById('location-search');
        this.ratingFilter = document.getElementById('rating-filter');
        this.distanceFilter = document.getElementById('distance-filter');
        this.venueType = document.getElementById('venue-type');
        this.resultsContainer = document.getElementById('venue-results');
        
        this.searchButton.addEventListener('click', () => this.searchVenues());
        
        // Foursquare API endpoints
        this.FOURSQUARE_API_ENDPOINT = 'https://api.foursquare.com/v3/places/search';
        
        // Enable location-based search
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                this.userLat = position.coords.latitude;
                this.userLng = position.coords.longitude;
            });
        }
    }

    async searchVenues() {
        const location = this.locationInput.value;
        const minRating = this.ratingFilter.value;
        const radius = this.distanceFilter.value;
        const category = this.venueType.value;

        if (!location && !this.userLat) {
            toaster.error('Please enter a location or allow location access');
            return;
        }

        try {
            this.showLoading();
            const venues = await this.fetchFoursquareVenues(location, radius, category);
            const filteredVenues = venues.filter(venue => 
                !minRating || (venue.rating && venue.rating >= parseFloat(minRating))
            );
            this.displayVenues(filteredVenues);
        } catch (error) {
            console.error('Error fetching venues:', error);
            this.showError(error.message || 'Error fetching venues. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async fetchFoursquareVenues(location, radius, category) {
        try {
            const params = new URLSearchParams({
                categories: category,
                sort: 'RATING',
                limit: 50
            });

            // Use location input if provided, otherwise fall back to user's coordinates
            if (location) {
                params.append('near', location);
            } else if (this.userLat && this.userLng) {
                params.append('ll', `${this.userLat},${this.userLng}`);
                // Only append radius when using coordinates
                if (radius) {
                    const radiusInMeters = Math.min(Math.round(radius * 1000), 100000);
                    params.append('radius', radiusInMeters);
                }
            }

            const response = await fetch(`${this.FOURSQUARE_API_ENDPOINT}?${params}`, {
                headers: {
                    'Authorization': config.FOURSQUARE_API_KEY,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to fetch venues (${response.status}): ${errorData.message || 'Unknown error'}`
                );
            }

            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                throw new Error('No venues found in this location');
            }

            // Log the first venue to check its structure
            console.log('Sample venue data:', data.results[0]);

            // Helper function to delay execution
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Process venues in smaller batches with delay
            const processVenueWithRetry = async (venue, retries = 3) => {
                try {
                    // Add a small delay between requests
                    await delay(100);

                    const photoResponse = await fetch(
                        `https://api.foursquare.com/v3/places/${venue.fsq_id}/photos`,
                        {
                            headers: {
                                'Authorization': config.FOURSQUARE_API_KEY,
                                'Accept': 'application/json'
                            }
                        }
                    );

                    if (!photoResponse.ok) {
                        if (retries > 0 && photoResponse.status === 429) {  // Rate limit hit
                            await delay(1000);  // Wait longer before retry
                            return processVenueWithRetry(venue, retries - 1);
                        }
                        return null;
                    }

                    const photos = await photoResponse.json();
                    return photos;
                } catch (error) {
                    console.error(`Error fetching photos for venue ${venue.name}:`, error);
                    return null;
                }
            };

            return await Promise.all(data.results.map(async venue => {
                const photos = await processVenueWithRetry(venue);

                return {
                    id: venue.fsq_id,
                    name: venue.name,
                    rating: venue.rating || 'N/A',
                    address: venue.location.formatted_address || 'Address not available',
                    distance: venue.distance ? `${(venue.distance / 1000).toFixed(1)} km` : 'N/A',
                    phone: venue.tel || 'Phone not available',
                    image: photos?.[0] ? 
                        `${photos[0].prefix}original${photos[0].suffix}` : 
                        'https://placehold.co/400x300?text=No+Image',
                    url: venue.website || '#',
                    reviews: venue.stats?.total_ratings || 0,
                    price: venue.price_tier ? '💰'.repeat(venue.price_tier) : 'N/A'
                };
            }));

        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    showLoading() {
        this.resultsContainer.innerHTML = '<div class="loading"></div>';
        this.searchButton.disabled = true;
    }

    hideLoading() {
        this.searchButton.disabled = false;
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 1rem;">
                ${message}
            </div>
        `;
        toaster.error(message);
    }

    displayVenues(venues) {
        this.resultsContainer.innerHTML = '';
        
        if (venues.length === 0) {
            this.showError('No venues found matching your criteria.');
            return;
        }
        
        venues.forEach(venue => {
            const venueElement = document.createElement('div');
            venueElement.className = 'venue-card';
            venueElement.innerHTML = `
                <div class="venue-image" style="background-image: url('${venue.image}')"></div>
                <h3>${venue.name}</h3>
                <div class="venue-info">
                    <p>
                        <i class="fas fa-star"></i>
                        <span>${venue.rating} ${venue.rating !== 'N/A' ? '⭐' : ''} (${venue.reviews} reviews)</span>
                    </p>
                    <p>
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${venue.address}</span>
                    </p>
                    <p>
                        <i class="fas fa-route"></i>
                        <span>${venue.distance}</span>
                    </p>
                    <p>
                        <i class="fas fa-phone"></i>
                        <span>${venue.phone}</span>
                    </p>
                    <p>
                        <i class="fas fa-money-bill"></i>
                        <span>${venue.price}</span>
                    </p>
                </div>
                <div class="venue-actions">
                    <button onclick="venueManager.selectVenue('${venue.id}', '${venue.name.replace(/'/g, "\\'")}')">
                        Select Venue
                    </button>
                    ${venue.url !== '#' ? 
                        `<a href="${venue.url}" target="_blank" class="view-details">
                            Visit Website
                        </a>` : 
                        ''}
                </div>
            `;
            this.resultsContainer.appendChild(venueElement);
        });
    }

    selectVenue(venueId, venueName) {
        const venueData = {
            id: venueId,
            name: venueName,
            selectedAt: new Date().toISOString()
        };
        localStorage.setItem('selectedVenue', JSON.stringify(venueData));
        toaster.success(`Selected venue: ${venueName}`);
    }
}

const venueManager = new VenueManager(); 