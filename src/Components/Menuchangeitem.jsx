import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Menuchangeitem = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [itemName, setItemName] = useState('');
    const [isVeg, setIsVeg] = useState(1); // Default to 'Veg'
    const [message, setMessage] = useState('');

    // Retrieve the JWT token from Redux store
    const reduxAuth = useSelector((state) => state.auth);
    
    // Parse the token, removing extra quotes
    const jwtToken = reduxAuth.token ? reduxAuth.token.replace(/^"|"$/g, '') : null;

    useEffect(() => {
        console.log('JWT Token:', jwtToken); // Debug log
        console.log('Redux Auth State:', reduxAuth); // Debug log

        // Fetch the list of food categories from the backend API
        if (jwtToken) {
            axios.get('https://www.backend.amddas.net/api/food-categories', {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            })
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Error fetching food categories:', error);
                setMessage('Error fetching food categories.');
            });
        } else {
            console.error('No JWT token found. Please log in.');
            setMessage('Please log in to access this page.');
        }
    }, [jwtToken]);

    const handleCategoryChange = (e) => {
        setSelectedCategoryId(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare the FoodItemDTO object
        const foodItemDTO = {
            itemName: itemName,
            isVeg: isVeg,
            isFullDish: 1, // by default 1
            price: 0,       // by default 0
            category: {
                categoryId: selectedCategoryId
            }
        };

        // Send POST request to create new food item
        axios.post('https://www.backend.amddas.net/api/food-items', foodItemDTO, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            setMessage('Food item created successfully!');
            // Clear the form
            setItemName('');
            setIsVeg(1);
        })
        .catch(error => {
            console.error('Error creating food item:', error);
            setMessage('Error creating food item.');
        });
    };

    return (
        <div>
            <h1>Add Food Item</h1>
            {message && <p>{message}</p>}
            {jwtToken ? (
                <>
                    <div>
                        <label>Select Food Category:</label>
                        <select value={selectedCategoryId || ''} onChange={handleCategoryChange}>
                            <option value="">-- Select Category --</option>
                            {categories.map(category => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCategoryId && (
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Item Name:</label>
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Is Veg:</label>
                                <select value={isVeg} onChange={(e) => setIsVeg(parseInt(e.target.value))}>
                                    <option value={1}>Veg</option>
                                    <option value={2}>Egg</option>
                                    <option value={0}>Non-Veg</option>
                                </select>
                            </div>
                            <button type="submit">Add Food Item</button>
                        </form>
                    )}
                </>
            ) : (
                <p>Please log in to access this page.</p>
            )}
        </div>
    );
};

export default Menuchangeitem;