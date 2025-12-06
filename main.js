const appState = {
    currentSection: 'home',
    uploadedImage: null,
    diagnosisData: null,
    userLocation: null,
    communityPosts: [],
    libraryData: []
};
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadCommunityPosts();
    loadLibraryContent();
    
    requestUserLocation();

    showSection('home');
    initializeOfflineStorage();
    
    console.log('CropCare initialized successfully');
}

function setupEventListeners() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });

        uploadArea.addEventListener('drop', handleDrop, false);
    }
    const diagnosisForm = document.getElementById('diagnosisForm');
    if (diagnosisForm) {
        diagnosisForm.addEventListener('submit', handleDiagnosisSubmit);
    }

    const communityPostForm = document.getElementById('communityPostForm');
    if (communityPostForm) {
        communityPostForm.addEventListener('submit', handleCommunityPost);
    }
    
    const librarySearch = document.getElementById('librarySearch');
    if (librarySearch) {
        librarySearch.addEventListener('input', handleLibrarySearch);
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('uploadArea').classList.add('dragging');
}

function unhighlight(e) {
    document.getElementById('uploadArea').classList.remove('dragging');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFiles(files) {
    ([...files]).forEach(uploadFile);
}

function uploadFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    // Read and display the image
    const reader = new FileReader();
    reader.onload = function(e) {
        appState.uploadedImage = e.target.result;
        displayImagePreview(e.target.result);
        showCropInfoForm();
    };
    reader.readAsDataURL(file);
}

function displayImagePreview(imageSrc) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `
        <div style="text-align: center;">
            <img src="${imageSrc}" alt="Uploaded plant image" 
                style="max-width: 100%; max-height: 400px; border-radius: 10px; box-shadow: var(--shadow);">
            <div class="mt-2">
                <button class="btn btn-secondary" onclick="removeImage()">Remove Image</button>
            </div>
        </div>
    `;
    preview.classList.remove('hidden');
}

function showCropInfoForm() {
    const form = document.getElementById('cropInfoForm');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function removeImage() {
    appState.uploadedImage = null;
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('cropInfoForm').style.display = 'none';
    document.getElementById('fileInput').value = '';
}

function handleDiagnosisSubmit(event) {
    event.preventDefault();
    
    if (!appState.uploadedImage) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    
    // Show loading state
    showNotification('Analyzing your plant image...', 'info');
    
    // Simulate AI diagnosis (in real implementation, this would call the backend API)
    setTimeout(() => {
        const diagnosisData = generateMockDiagnosis();
        displayDiagnosisResults(diagnosisData);
    }, 2000);
}

function generateMockDiagnosis() {
    const cropType = document.getElementById('cropType').value;
    const symptoms = document.getElementById('symptoms').value.toLowerCase();
    
    // Mock diagnosis logic (in real implementation, this would be AI-powered)
    const diagnoses = {
        tomato: {
            name: 'Early Blight',
            cause: 'Fungal infection (Alternaria solani)',
            severity: 'Moderate',
            description: 'Early blight is a common fungal disease that affects tomato plants, causing dark spots on leaves and fruits.',
            symptoms: ['Dark brown spots on older leaves', 'Yellowing around spots', 'Fruit lesions'],
            treatment: {
                organic: 'Apply copper-based fungicide spray weekly. Remove affected leaves and improve air circulation.',
                chemical: 'Apply chlorothalonil or mancozeb fungicide according to label instructions.',
                preventive: 'Use disease-resistant varieties, practice crop rotation, ensure proper spacing, and avoid overhead watering.'
            }
        },
        potato: {
            name: 'Late Blight',
            cause: 'Fungal infection (Phytophthora infestans)',
            severity: 'Severe',
            description: 'Late blight is a devastating disease that can destroy entire potato crops quickly.',
            symptoms: ['Water-soaked spots on leaves', 'White fuzzy growth on undersides', 'Dark brown lesions on tubers'],
            treatment: {
                organic: 'Apply copper spray immediately. Destroy infected plants to prevent spread.',
                chemical: 'Apply metalaxyl or mefenoxam-based fungicides. Multiple applications may be needed.',
                preventive: 'Use resistant varieties, ensure good drainage, avoid excessive nitrogen, and monitor weather conditions.'
            }
        }
    };
    
    // Default diagnosis if crop not in our database
    const defaultDiagnosis = {
        name: 'Nutrient Deficiency',
        cause: 'Lack of essential nutrients',
        severity: 'Mild',
        description: 'Based on the symptoms, this appears to be a nutrient deficiency rather than a disease.',
        symptoms: ['Yellowing leaves', 'Stunted growth', 'Poor leaf development'],
        treatment: {
            organic: 'Apply compost or well-rotted manure. Use organic fertilizers rich in nitrogen, phosphorus, and potassium.',
            chemical: 'Apply balanced NPK fertilizer according to soil test recommendations.',
            preventive: 'Conduct regular soil tests, maintain proper pH, use crop rotation, and apply appropriate fertilizers.'
        }
    };
    
    return diagnoses[cropType] || defaultDiagnosis;
}

function displayDiagnosisResults(diagnosisData) {
    const resultsDiv = document.getElementById('diagnosisResults');
    
    resultsDiv.innerHTML = `
        <div class="card">
            <div class="status status-${diagnosisData.severity === 'Severe' ? 'error' : diagnosisData.severity === 'Moderate' ? 'warning' : 'info'}">
                <strong>Diagnosis:</strong> ${diagnosisData.name} (${diagnosisData.severity} Severity)
            </div>
            
            <h2>Diagnosis Results</h2>
            
            <div class="mb-3">
                <h3>📋 ${diagnosisData.name}</h3>
                <p><strong>Cause:</strong> ${diagnosisData.cause}</p>
                <p><strong>Description:</strong> ${diagnosisData.description}</p>
            </div>
            
            <div class="mb-3">
                <h4>Identified Symptoms:</h4>
                <ul>
                    ${diagnosisData.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                </ul>
            </div>
            
            <div class="mb-3">
                <h4>💊 Treatment Recommendations:</h4>
                
                <div class="card" style="background: rgba(46, 204, 113, 0.1);">
                    <h5>🌿 Organic Treatment:</h5>
                    <p>${diagnosisData.treatment.organic}</p>
                </div>
                
                <div class="card" style="background: rgba(52, 152, 219, 0.1);">
                    <h5>⚗️ Chemical Treatment:</h5>
                    <p>${diagnosisData.treatment.chemical}</p>
                </div>
                
                <div class="card" style="background: rgba(243, 156, 18, 0.1);">
                    <h5>🛡️ Preventive Measures:</h5>
                    <p>${diagnosisData.treatment.preventive}</p>
                </div>
            </div>
            
            <div class="text-center">
                <button class="btn btn-primary" onclick="saveDiagnosis()">Save Diagnosis</button>
                <button class="btn btn-secondary" onclick="shareDiagnosis()">Share Results</button>
                <button class="btn btn-outline" onclick="startNewDiagnosis()">New Diagnosis</button>
            </div>
        </div>
    `;
    
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Diagnosis completed successfully!', 'success');
}

function saveDiagnosis() {
    // Save to local storage for offline access
    const diagnosis = {
        id: Date.now(),
        image: appState.uploadedImage,
        data: appState.diagnosisData,
        date: new Date().toISOString()
    };
    
    let savedDiagnoses = JSON.parse(localStorage.getItem('cropcare_diagnoses') || '[]');
    savedDiagnoses.push(diagnosis);
    localStorage.setItem('cropcare_diagnoses', JSON.stringify(savedDiagnoses));
    
    showNotification('Diagnosis saved successfully!', 'success');
}

function shareDiagnosis() {
    if (navigator.share) {
        navigator.share({
            title: 'CropCare Diagnosis Results',
            text: 'I got my plant diagnosed using CropCare!',
            url: window.location.href
        });
    } else {
        showNotification('Link copied to clipboard!', 'success');
    }
}

function startNewDiagnosis() {
    // Reset form
    removeImage();
    document.getElementById('diagnosisForm').reset();
    document.getElementById('diagnosisResults').classList.add('hidden');
    
    // Scroll to top of diagnosis section
    document.getElementById('diagnose').scrollIntoView({ behavior: 'smooth' });
}

function handleCommunityPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('questionTitle').value;
    const details = document.getElementById('questionDetails').value;
    const image = document.getElementById('questionImage').files[0];
    
    const post = {
        id: Date.now(),
        title: title,
        details: details,
        author: 'Farmer User', // In real app, this would be the logged-in user
        date: new Date().toISOString(),
        replies: 0,
        views: 0,
        image: image ? URL.createObjectURL(image) : null
    };
    
    appState.communityPosts.unshift(post);
    displayCommunityPosts();
    
    // Reset form
    event.target.reset();
    showNotification('Question posted successfully!', 'success');
}

function displayCommunityPosts() {
    const postsDiv = document.getElementById('communityPosts');
    
    if (appState.communityPosts.length === 0) {
        postsDiv.innerHTML = `
            <div class="card">
                <p style="text-align: center; color: var(--text-light);">
                    No questions posted yet. Be the first to ask a question!
                </p>
            </div>
        `;
        return;
    }
    
    postsDiv.innerHTML = appState.communityPosts.map(post => `
        <div class="card">
            <h3>${post.title}</h3>
            <p>${post.details}</p>
            ${post.image ? `<img src="${post.image}" alt="Question image" style="max-width: 200px; border-radius: 5px;">` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <small style="color: var(--text-light);">
                    Posted by ${post.author} • ${formatDate(post.date)}
                </small>
                <div>
                    <span style="margin-right: 1rem;">💬 ${post.replies} replies</span>
                    <span>👁️ ${post.views} views</span>
                </div>
            </div>
            <div class="mt-2">
                <button class="btn btn-outline" onclick="viewPost(${post.id})">View Details</button>
                <button class="btn btn-secondary" onclick="replyToPost(${post.id})">Reply</button>
            </div>
        </div>
    `).join('');
}

function loadCommunityPosts() {
    // Load sample community posts
    appState.communityPosts = [
        {
            id: 1,
            title: 'Yellow leaves on tomato plants',
            details: 'My tomato plants are developing yellow leaves from the bottom up. The plants are about 2 months old and I\'ve been watering regularly. What could be causing this?',
            author: 'Ramesh Kumar',
            date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            replies: 3,
            views: 45,
            image: null
        },
        {
            id: 2,
            title: 'Pests attacking my chili plants',
            details: 'Small insects are eating holes in my chili leaves. I\'ve tried neem oil but it\'s not working. Please help!',
            author: 'Sita Devi',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            replies: 5,
            views: 78,
            image: null
        },
        {
            id: 3,
            title: 'Best fertilizer for rice crop',
            details: 'What\'s the best fertilizer schedule for rice in the monsoon season? I\'m farming in Maharashtra.',
            author: 'Vikram Singh',
            date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            replies: 7,
            views: 120,
            image: null
        }
    ];
    
    displayCommunityPosts();
}

function loadLibraryContent() {
    // Load sample library content
    const libraryContent = [
        {
            title: 'Tomato Growing Guide',
            category: 'Vegetables',
            summary: 'Complete guide to growing healthy tomatoes from seed to harvest.',
            readTime: '5 min read'
        },
        {
            title: 'Common Potato Diseases',
            category: 'Diseases',
            summary: 'Identify and treat common potato diseases including early and late blight.',
            readTime: '7 min read'
        },
        {
            title: 'Organic Pest Control',
            category: 'Treatments',
            summary: 'Natural and organic methods to control common garden pests.',
            readTime: '4 min read'
        },
        {
            title: 'Rice Cultivation Best Practices',
            category: 'Cereals',
            summary: 'Optimal techniques for maximum rice yield and quality.',
            readTime: '6 min read'
        }
    ];
    
    displayLibraryContent(libraryContent);
}

function displayLibraryContent(content) {
    const libraryDiv = document.getElementById('libraryContent');
    
    libraryDiv.innerHTML = content.map(item => `
        <div class="card">
            <h3>${item.title}</h3>
            <p><strong>Category:</strong> ${item.category}</p>
            <p>${item.summary}</p>
            <small style="color: var(--text-light);">${item.readTime}</small>
            <div class="mt-2">
                <button class="btn btn-primary" onclick="viewArticle('${item.title}')">Read More</button>
            </div>
        </div>
    `).join('');
}

function handleLibrarySearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm.length < 2) {
        loadLibraryContent();
        return;
    }
    
    const filteredContent = [
        {
            title: 'Tomato Growing Guide',
            category: 'Vegetables',
            summary: 'Complete guide to growing healthy tomatoes from seed to harvest.',
            readTime: '5 min read'
        },
        {
            title: 'Common Potato Diseases',
            category: 'Diseases',
            summary: 'Identify and treat common potato diseases including early and late blight.',
            readTime: '7 min read'
        },
        {
            title: 'Organic Pest Control',
            category: 'Treatments',
            summary: 'Natural and organic methods to control common garden pests.',
            readTime: '4 min read'
        },
        {
            title: 'Rice Cultivation Best Practices',
            category: 'Cereals',
            summary: 'Optimal techniques for maximum rice yield and quality.',
            readTime: '6 min read'
        }
    ].filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.summary.toLowerCase().includes(searchTerm)
    );
    
    displayLibraryContent(filteredContent);
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        appState.currentSection = sectionId;
    }
    
    // Close mobile menu
    const nav = document.querySelector('nav');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (nav && mobileToggle) {
        nav.classList.remove('active');
        mobileToggle.textContent = '☰';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `status status-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function requestUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                appState.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('User location obtained:', appState.userLocation);
            },
            error => {
                console.log('Location access denied:', error);
            }
        );
    }
}

function initializeOfflineStorage() {
    // Check if service worker is available
    if ('serviceWorker' in navigator) {
        // In a real implementation, you would register a service worker here
        console.log('Service Worker support detected');
    }
    
    // Load saved diagnoses from local storage
    const savedDiagnoses = localStorage.getItem('cropcare_diagnoses');
    if (savedDiagnoses) {
        console.log('Loaded saved diagnoses from local storage');
    }
}

// Placeholder functions for features to be implemented
function viewPost(postId) {
    showNotification('Post details feature coming soon!', 'info');
}

function replyToPost(postId) {
    showNotification('Reply feature coming soon!', 'info');
}

function viewArticle(title) {
    showNotification(`Opening article: ${title}`, 'info');
}

// Add animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export for potential module usage
window.CropCare = {
    appState,
    showSection,
    showNotification,
    saveDiagnosis,
    startNewDiagnosis
};