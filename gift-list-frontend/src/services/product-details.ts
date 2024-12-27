export async function fetchProductDetails(url: string) {
  try {
    // Try to fetch metadata using a CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('Failed to fetch product details');
    }

    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    let title = '';
    let image = '';
    let description = '';
    let price = 0;

    // Debug log to check the HTML content
    console.log('Fetched HTML:', data.contents.substring(0, 500) + '...');

    // Check if it's Shopee
    if (url.includes('shopee')) {
      // Shopee specific selectors - try multiple possible selectors
      // Try JSON-LD data first (more reliable when available)
      const jsonLd = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent || '{}');
          } catch {
            return {};
          }
        })
        .find(data => data['@type'] === 'Product');

      title = jsonLd?.name ||
              doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
              doc.querySelector('[data-testid="product-name"]')?.textContent ||
              doc.querySelector('.attM6y')?.textContent ||
              doc.querySelector('._44qnta')?.textContent ||
              doc.querySelector('.product-name')?.textContent || '';
              
      image = jsonLd?.image ||
              doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
              doc.querySelector('meta[property="og:image:secure_url"]')?.getAttribute('content') ||
              doc.querySelector('[data-testid="product-image"] img')?.getAttribute('src') ||
              doc.querySelector('._7f_P_q img')?.getAttribute('src') ||
              doc.querySelector('.product-image img')?.getAttribute('src') || '';
              
      description = jsonLd?.description ||
                   doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                   doc.querySelector('[data-testid="product-description"]')?.textContent ||
                   doc.querySelector('._2jz573')?.textContent ||
                   doc.querySelector('.product-description')?.textContent || '';
                   
      // Try multiple price selectors
      const priceSelectors = [
        '.pqTWkA',
        '.WC0us+',
        '._3n5NQx',
        '[data-testid="product-price"]',
        'meta[property="product:price:amount"]',
        '.product-price',
        '.price',
        '[itemprop="price"]'
      ];

      // Try to get price from JSON-LD first
      if (jsonLd?.offers?.price) {
        price = parseFloat(jsonLd.offers.price);
        console.log('Price found in JSON-LD:', price);
      }
      
      let priceText = '';
      for (const selector of priceSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          priceText = element.tagName.toLowerCase() === 'meta' 
            ? element.getAttribute('content') || ''
            : element.textContent || '';
          break;
        }
      }

      if (priceText) {
        console.log('Found price text:', priceText);
        // Remove currency symbol, dots from thousand separators and convert comma to dot
        const cleanPrice = priceText.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
        console.log('Cleaned price:', cleanPrice);
        price = parseFloat(cleanPrice) || 0;
      } else {
        console.log('No price found with selectors:', priceSelectors);
      }

      // Debug logs
      console.log('Shopee extracted data:', {
        title,
        image,
        description: description.substring(0, 100) + '...',
        price
      });
    }
    // Check if it's Mercado Livre
    else if (url.includes('mercadolivre') || url.includes('mercadolibre')) {
      // Try JSON-LD data first
      const jsonLd = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent || '{}');
          } catch {
            return {};
          }
        })
        .find(data => data['@type'] === 'Product');

      // Mercado Livre specific selectors
      title = jsonLd?.name ||
              doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
              doc.querySelector('h1.ui-pdp-title')?.textContent ||
              doc.querySelector('.ui-pdp-title')?.textContent || '';
              
      image = jsonLd?.image ||
              doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
              doc.querySelector('.ui-pdp-gallery__figure img')?.getAttribute('src') ||
              doc.querySelector('.ui-pdp-image')?.getAttribute('src') || '';
              
      description = jsonLd?.description ||
                   doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                   doc.querySelector('.ui-pdp-description__content')?.textContent ||
                   doc.querySelector('#description')?.textContent || '';

      // Try to get price from JSON-LD first
      if (jsonLd?.offers?.price) {
        price = parseFloat(jsonLd.offers.price);
        console.log('ML Price found in JSON-LD:', price);
      } else {
        const priceSelectors = [
          'meta[property="product:price:amount"]',
          '.ui-pdp-price__second-line .price-tag-amount',
          '.ui-pdp-price__second-line span[content]',
          '.price-tag-fraction'
        ];
        
        let priceText = '';
        for (const selector of priceSelectors) {
          const element = doc.querySelector(selector);
          if (element) {
            priceText = element.tagName.toLowerCase() === 'meta' 
              ? element.getAttribute('content') || ''
              : element.textContent || '';
            break;
          }
        }

        if (priceText) {
          console.log('ML Found price text:', priceText);
          const cleanPrice = priceText.replace(/[^0-9.,]/g, '').replace(',', '.');
          console.log('ML Cleaned price:', cleanPrice);
          price = parseFloat(cleanPrice) || 0;
        }
      }

      // Debug logs
      console.log('Mercado Livre extracted data:', {
        title,
        image,
        description: description.substring(0, 100) + '...',
        price
      });
    }
    // Default to generic Open Graph metadata for other sites
    else {
      title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
              doc.querySelector('meta[name="title"]')?.getAttribute('content') ||
              doc.querySelector('title')?.textContent || '';
              
      image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
              doc.querySelector('meta[property="product:image"]')?.getAttribute('content') || '';
              
      description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                   doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
                   
      const priceContent = doc.querySelector('meta[property="product:price:amount"]')?.getAttribute('content') ||
                          doc.querySelector('meta[property="og:price:amount"]')?.getAttribute('content');
      price = priceContent ? parseFloat(priceContent) : 0;
    }

    const result = {
      title,
      image,
      description,
      price
    };

    console.log('Final extracted data:', result);
    return result;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}
