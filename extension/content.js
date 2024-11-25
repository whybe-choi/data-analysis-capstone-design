// first-page.js - 첫 번째 페이지에서 실행될 코드
function showToastWithSpinner(message) {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.style.maxWidth = '400px';
  toast.style.margin = '0 auto';
  toast.style.backgroundColor = '#d4edda';
  toast.style.color = '#155724';
  toast.style.textAlign = 'center';
  toast.style.padding = '12px 20px';
  toast.style.position = 'fixed';
  toast.style.zIndex = '9999';
  toast.style.top = '-50px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  toast.style.fontSize = '16px';
  toast.style.fontWeight = 'bold';
  toast.style.transition = 'top 0.5s ease, opacity 0.5s ease';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';

  // 로딩 스피너 생성
  const spinner = document.createElement('div');
  spinner.style.width = '20px';
  spinner.style.height = '20px';
  spinner.style.border = '3px solid #155724';
  spinner.style.borderTop = '3px solid transparent';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'spin 1s linear infinite';
  spinner.style.marginRight = '8px';

  // 애니메이션 추가
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);

  // 메시지 추가
  const text = document.createTextNode(message);

  // Toast에 스피너와 메시지 추가
  toast.appendChild(spinner);
  toast.appendChild(text);
  document.body.appendChild(toast);
  toastElement = toast;

  // 나타나는 애니메이션
  setTimeout(() => {
    toast.style.visibility = 'visible';
    toast.style.top = '20px';
    toast.style.opacity = '1';
  }, 100);

}

function hideToast() {
  if (toastElement) {
    toastElement.remove();
    toastElement = null;
  }
}



const inputClassName = 'sc-97s1c6-2 lakDJv search-home-search-bar-keyword gtm-click-button';

const mainButtonClassName = 'inline-flex items-center justify-center group-data-[disabled]:cursor-not-allowed size-5 sc-97s1c6-8 iZyLnB search-home-search-bar-icon-search gtm-click-button';
const resultButtonClassName = 'inline-flex items-center justify-center group-data-[disabled]:cursor-not-allowed focus:outline-none size-5 sc-97s1c6-8 iZyLnB search-home-search-bar-icon-search gtm-click-button'

const mainTriggerButtonClassName = 'sc-1q6lx9i-2 dXeewP gtm-click-button';
const resultTriggerButtonClassName = 'sc-185p62g-2 gMYVoG'

function clickSearchButton(buttonclassNAme, resultInputText) {
  setTimeout(() => {
    const button = document.getElementsByClassName(buttonclassNAme)[0];
    const inputText = document.getElementsByClassName(inputClassName)[0];
    if (button) {
      if (resultInputText !== '') {
        inputText.textContent = resultInputText;
      }

      button.addEventListener('click', function (e) {
        e.stopImmediatePropagation();
        const queryText = inputText.value;

        showToastWithSpinner("스마트 서치로 검색 중...");

        fetch('http://localhost:8080/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: queryText })
        })
          .then(response => response.json())
          .then(data => {
            console.log("서버 응답:", data.product_data[0]);
            localStorage.setItem('searchData', JSON.stringify(data));
            localStorage.setItem('redirectPending', 'true');
            window.location.href = `https://www.musinsa.com/search/goods?keyword=cloth`;

          })
          .catch(error => console.error("오류 발생:", error));

      });
    }
  }, 500);
};


setTimeout(() => {
  const mainTriggerButton = document.getElementsByClassName(mainTriggerButtonClassName)[0];
  const resultTriggerButton = document.getElementsByClassName(resultTriggerButtonClassName)[0];


  if (mainTriggerButton) { mainTriggerButton.addEventListener('click', () => clickSearchButton(mainButtonClassName, '')); }
  else if (resultTriggerButton) {
    const inputText = document.getElementsByClassName('text-body_14px_reg font-pretendard')[0].textContent;
    if (inputText) {
      resultTriggerButton.addEventListener('click', () => clickSearchButton(resultButtonClassName, inputText));
    }
  }

}, 500);



// 공통으로 사용할 데이터 로드 함수
const loadStoredData = () => {
  const storedData = localStorage.getItem('searchData');
  if (storedData) {
    return JSON.parse(storedData);
  }
  return null;
};



const updateProductData = () => {
  const itemNumber = document.getElementsByClassName('text-body_13px_reg text-gray-600 font-pretendard');
  if (itemNumber) {
    itemNumber[0].textContent = "상위 10개";
    itemNumber[1].textContent = "스마트 서치 정확도순";
  }
  const searchData = loadStoredData();
  if (!searchData || !searchData.product_data) {

    return;
  }

  const productDivs = document.getElementsByClassName('sc-x7dw99-1 ghYdjv');
  const MAX_PRODUCTS = 10;

  const productDivsArray = Array.from(productDivs);


  productDivsArray.forEach((div, index) => {
    if (index < MAX_PRODUCTS && index < searchData.product_data.length) {
      const productData = searchData.product_data[index].metadata;

      const anchorTags_a = div.getElementsByTagName('a')[0];

      // 1. 이미지 업데이트
      const images = div.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        if (img.className.includes('max-w-full') &&
          img.className.includes('w-full') &&
          img.className.includes('absolute')) {
          img.src = productData.img_url;
        }
      });


      if (anchorTags_a.className === 'sc-1rosu2b-0 edFlCY gtm-impression-content gtm-click-content') {
        // href 업데이트
        anchorTags_a.href = productData.product_link.toLocaleString();

        // figcaption 삭제
        const figcaption = anchorTags_a.getElementsByClassName('sc-1rosu2b-2 jxcNxn')[0];
        if (figcaption && figcaption.parentElement) {
          figcaption.parentElement.removeChild(figcaption);
          const newDiv = document.createElement('div');
          newDiv.className = 'sc-kMzELR cPFBAu';
          newDiv.innerHTML = `
            <div class="sc-ilxebA hQIHhD">
              <a href="${productData.product_link}" target="_blank" rel="noreferrer" aria-label="${productData.brand_id} 샵으로 이동">
                <span class="text-etc_11px_semibold sc-eDLKkx sc-jTQCzO bnDFEJ cMkxIw font-pretendard">${productData.brand_id}</span>
              </a>
              <a href="${productData.product_link}" target="_blank" rel="noreferrer" aria-label="${productData.product_name} 상품 상세로 이동" class="gtm-select-item">
                <span class="text-body_13px_reg sc-eDLKkx sc-gLLuof bnDFEJ fRGBNZ font-pretendard">${productData.product_name}</span>
              </a>
              <div class="sc-guDLey sc-dmyCSP jlrYiO tzoUH">
                <span class="text-body_13px_semi sc-hLQSwg iXeGsA font-pretendard">${productData.price.toLocaleString()}원</span>
              </div>
            </div>
            <div class="sc-qZrbh dzTuBy"><div class="sc-jsEeTM dizzij"><svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="sc-irLvIq bxFGHv"><path d="M9.80392 16.3294C9.91639 16.4275 10.0836 16.4275 10.1961 16.3294C11.0801 15.5587 14.7183 12.3692 16.25 10.75C16.9 10 17.5 9 17.5 7.5C17.5 5.25 16 3.5 13.75 3.5C11.85 3.5 10.8 4.65 10 6C9.2 4.65 8.15 3.5 6.25 3.5C4 3.5 2.5 5.25 2.5 7.5C2.5 9 3.1 10 3.75 10.75C5.28165 12.3692 8.91988 15.5587 9.80392 16.3294Z" stroke-miterlimit="10" fill-opacity="1" fill="" stroke="" class="stroke-red fill-red" vector-effect="non-scaling-stroke"></path></svg><span class="text-etc_11px_reg text-red font-pretendard">8.0만</span></div><div class="sc-jsEeTM dizzij"><svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="sc-csKJxZ hhGfkp"><path d="M10.2707 1.06689C10.162 0.839265 9.83799 0.839265 9.72928 1.06689L7.16594 6.43467C7.12297 6.52464 7.03812 6.58739 6.9395 6.60211L1.0893 7.4751C0.84556 7.51147 0.747211 7.80993 0.921583 7.98408L5.14053 12.1976C5.20921 12.2662 5.24046 12.3638 5.2244 12.4595L4.22835 18.3961C4.18708 18.6422 4.44661 18.8281 4.6663 18.71L9.85791 15.9182C9.94663 15.8705 10.0534 15.8705 10.1421 15.9182L15.3337 18.71C15.5534 18.8281 15.8129 18.6422 15.7716 18.3961L14.7756 12.4597C14.7595 12.3639 14.7909 12.2662 14.8596 12.1976L19.0783 7.99024C19.2527 7.81625 19.1547 7.51776 18.911 7.48116L13.0603 6.60223C12.9618 6.58744 12.8771 6.52472 12.8341 6.43484L10.2707 1.06689Z" class="fill-yellow" vector-effect="non-scaling-stroke"></path></svg><div class="sc-kFCroH fyDqTQ"><span class="text-etc_11px_reg text-yellow font-pretendard">4.8</span><span class="text-etc_11px_reg text-yellow font-pretendard">(7천+)</span></div></div></div>
            <div class="pt-2.5"><div class="relative"><div class="block focus:outline-none sc-iuOOrT hanfXK gtm-click-button" tabindex="0" data-index="5" data-section-name="goods_list" data-section-index="19" data-brand-id="standarderror" data-item-list-id="goods_list" data-item-list-index="5" data-item-applied-filter-group-1="(not set)" data-item-applied-filter-group-2="(not set)" data-item-ab-bucket="name_legacy_user_dictionary" data-button-id="goods_option" data-button-name="상품옵션 열기"><div style="position: relative;"><div class="flex items-center relative"><button type="button" class="sc-cyZbeP kVFxqp"><span class="text-etc_11px_reg font-normal text-gray-500 font-pretendard">옵션</span><span class="sc-lnsjTu oUDiE"><svg width="100%" height="100%" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="stroke-black" fill="none"><path d="M4 8L9.78787 13.7879C9.90503 13.905 10.095 13.905 10.2121 13.7879L16 8" class="stroke-gray-500" vector-effect="non-scaling-stroke"></path></svg></span></button></div></div></div><span class="text-etc_11px_reg absolute top-0 right-0 text-gray-500 font-pretendard">공용</span></div></div>
          `;
          // 새로운 div를 a 태그의 부모 요소에 추가
          anchorTags_a.parentElement.appendChild(newDiv);
        }
      }

      else {


        // 2. 브랜드명 업데이트
        const brandSpans = div.getElementsByClassName('text-etc_11px_semibold sc-eDLKkx sc-jTQCzO bnDFEJ cMkxIw font-pretendard');
        if (brandSpans.length > 0) {
          brandSpans[0].textContent = productData.brand_id;
        }

        // 3. 상품명 업데이트
        const productNameSpans = div.getElementsByClassName('text-body_13px_reg sc-eDLKkx sc-gLLuof bnDFEJ fRGBNZ font-pretendard');
        if (productNameSpans.length > 0) {
          productNameSpans[0].textContent = productData.product_name;
        }

        // 4. 가격 업데이트
        const priceSpans = div.getElementsByClassName('text-body_13px_semi sc-hLQSwg iXeGsA font-pretendard');
        if (priceSpans.length > 0) {
          priceSpans[0].textContent = `${productData.price.toLocaleString()}원`;
        }
        // 5. 할인율 태그 삭제
        const discountTags = div.getElementsByClassName('text-body_13px_semi sc-hLQSwg iXeGsA text-red font-pretendard');
        Array.from(discountTags).forEach(tag => {
          if (tag.parentElement) {
            tag.parentElement.removeChild(tag);
          }
        });

        var anchorTags = div.getElementsByTagName('a');
        if (anchorTags.length > 2) {
          anchorTags[0].href = productData.product_link.toLocaleString();
          anchorTags[1].href = productData.product_link.toLocaleString();
          anchorTags[2].href = productData.product_link.toLocaleString();
        }
      }

    } else {
      if (div.parentElement) {
        div.parentElement.removeChild(div);
      }
    }
  });


  const removedCount = productDivsArray.length - Math.min(MAX_PRODUCTS, searchData.product_data.length);
  if (removedCount > 0) {

  }
};


// MutationObserver 설정
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      // 검색어 업데이트 체크
      const searchKeywordElements = document.getElementsByClassName('sc-185p62g-2 gMYVoG');
      if (searchKeywordElements.length > 0) {
        const spanElements = searchKeywordElements[0].getElementsByClassName('text-body_14px_reg font-pretendard');
        if (spanElements.length > 0) {
          const searchData = loadStoredData();
          if (searchData && searchData.received_value) {
            spanElements[0].textContent = searchData.received_value;

          }
        }
      }

      // 상품 데이터 업데이트 체크
      const productDivs = document.getElementsByClassName('sc-x7dw99-1 ghYdjv');
      if (productDivs.length > 0) {

        updateProductData();
        preventInfiniteScroll(); // 무한 스크롤 방지 기능 실행
        observer.disconnect();
        break;
      }
    }
  }
});

// redirectPending 체크 후 observer 시작
if (localStorage.getItem('redirectPending') === 'true') {
  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
  localStorage.removeItem('redirectPending');
}

