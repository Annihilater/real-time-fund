export const dedupeByCode = (list) => {
  const seen = new Set();
  return list.filter((f) => {
    const c = f?.code;
    if (!c || seen.has(c)) return false;
    seen.add(c);
    return true;
  });
};

export const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      document.body.removeChild(script);
      resolve();
    };
    script.onerror = () => {
      document.body.removeChild(script);
      reject(new Error('数据加载失败'));
    };
    document.body.appendChild(script);
  });
};

const getTencentPrefix = (code) => {
  if (code.startsWith('6') || code.startsWith('9')) return 'sh';
  if (code.startsWith('0') || code.startsWith('3')) return 'sz';
  if (code.startsWith('4') || code.startsWith('8')) return 'bj';
  return 'sz';
};

export const fetchFundData = async (code) => {
  return new Promise((resolve, reject) => {
    const gzUrl = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`;

    const scriptGz = document.createElement('script');
    scriptGz.src = gzUrl;

    const originalJsonpgz = window.jsonpgz;
    window.jsonpgz = (json) => {
      window.jsonpgz = originalJsonpgz;
      if (!json || typeof json !== 'object') {
        reject(new Error('未获取到基金估值数据'));
        return;
      }
      const gszzlNum = Number(json.gszzl);
      const gzData = {
        code: json.fundcode,
        name: json.name,
        dwjz: json.dwjz,
        gsz: json.gsz,
        gztime: json.gztime,
        gszzl: Number.isFinite(gszzlNum) ? gszzlNum : json.gszzl
      };

      const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&year=&month=&rt=${Date.now()}`;
      loadScript(holdingsUrl)
        .then(async () => {
          let holdings = [];
          const html = window.apidata?.content || '';
          const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
          for (const r of rows) {
            const cells = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(td => td.replace(/<[^>]*>/g, '').trim());
            const codeIdx = cells.findIndex(txt => /^\d{6}$/.test(txt));
            const weightIdx = cells.findIndex(txt => /\d+(?:\.\d+)?\s*%/.test(txt));
            if (codeIdx >= 0 && weightIdx >= 0) {
              holdings.push({
                code: cells[codeIdx],
                name: cells[codeIdx + 1] || '',
                weight: cells[weightIdx],
                change: null
              });
            }
          }

          holdings = holdings.slice(0, 10);

          if (holdings.length) {
            try {
              const tencentCodes = holdings.map(h => `s_${getTencentPrefix(h.code)}${h.code}`).join(',');
              const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;

              await new Promise((resQuote) => {
                const scriptQuote = document.createElement('script');
                scriptQuote.src = quoteUrl;
                scriptQuote.onload = () => {
                  holdings.forEach(h => {
                    const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`;
                    const dataStr = window[varName];
                    if (dataStr) {
                      const parts = dataStr.split('~');
                      if (parts.length > 5) {
                        h.change = parseFloat(parts[5]);
                      }
                    }
                  });
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                scriptQuote.onerror = () => {
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                document.body.appendChild(scriptQuote);
              });
            } catch (err) {
              console.error('获取股票涨跌幅失败', err);
            }
          }

          resolve({ ...gzData, holdings });
        })
        .catch(() => resolve({ ...gzData, holdings: [] }));
    };

    scriptGz.onerror = () => {
      window.jsonpgz = originalJsonpgz;
      if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
      reject(new Error('基金数据加载失败'));
    };

    document.body.appendChild(scriptGz);
    setTimeout(() => {
      if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
    }, 5000);
  });
};
