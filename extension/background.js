chrome.runtime.onInstalled.addListener(() => {
  // 초기 상태를 OFF로 설정
  chrome.storage.local.set({ extensionState: 'OFF' });
  chrome.action.setBadgeText({ text: 'OFF' });
});

const musinsaURL = 'https://www.musinsa.com/';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(musinsaURL)) {
    chrome.storage.local.get('extensionState', async (data) => {
      const prevState = data.extensionState || 'OFF';
      const nextState = prevState === 'ON' ? 'OFF' : 'ON';

      // 상태 업데이트
      chrome.storage.local.set({ extensionState: nextState });
      await chrome.action.setBadgeText({ text: nextState });

      if (nextState === 'ON') {
        // content.js 주입
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });

        // Toast 알림 표시
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showToast,
          args: ['✔️ 스마트 서치 활성화']
        });
      } else {
        // content.js 비활성화
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: cleanupContentScript
        });

        // Toast 알림 표시
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showToast,
          args: ['❌ 스마트 서치 비활성화']
        });
      }
    });
  } else {
    console.log('This extension works only on musinsa.com');
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.url.startsWith(musinsaURL)) {
    chrome.storage.local.get('extensionState', async (data) => {
      const currentState = data.extensionState || 'OFF';
      if (currentState === 'ON') {
        await chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          files: ['content.js']
        });
        await chrome.action.setBadgeText({ text: 'ON' });
      } else {
        await chrome.action.setBadgeText({ text: 'OFF' });
      }
    });
  }
});

// cleanupContentScript 함수 정의
function cleanupContentScript() {
  const restoredElements = document.querySelectorAll('.my-custom-class');
  restoredElements.forEach((el) => el.remove());

  const buttons = document.querySelectorAll('.some-class');
  buttons.forEach((button) => {
    const clone = button.cloneNode(true);
    button.parentNode.replaceChild(clone, button);
  });

  console.log('Content script changes have been removed.');
  window.location.href = `https://www.musinsa.com/`;
}

// showToast 함수 정의
function showToast(message) {
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

  const text = document.createTextNode(message);
  toast.appendChild(text);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.visibility = 'visible';
    toast.style.top = '20px';
    toast.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    toast.style.top = '-50px';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 2000);
}
