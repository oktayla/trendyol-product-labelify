const initExtension = async () => {
  const html = document.body.innerHTML;
  const regex = /window\.pageType\s*=\s*"(.*?)";/;
  const match = html.match(regex);

  const [_, pageType] = match ?? [];

  if (pageType === 'productDetail') {
    const productUrl = new URL(window.location.href);
    const [_, category, productId] = productUrl.pathname.split('/');

    const comments = await fetchReviews({category, productId});
    if (comments) {
      try {
        const response = await chatCompletion(comments);
        addLabelsWidget(response.labels);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const fetchReviews = async({ category, productId }) => {
  const response = await fetch(`https://apigw.trendyol.com/discovery-web-socialgw-service/reviews/${category}/${productId}/yorumlar/?culture=tr-TR&storefrontId=1&RRsocialproofAbTesting=B&logged-in=false&isBuyer=false&channelId=1`);
  const data = await response.json();

  if (!data.isSuccess)
    return null;

  const hydrateScript = data.result.hydrateScript
    .split('window.__REVIEW_APP_INITIAL_STATE__ = ')[1]
    .split('};')[0]

  const result = JSON.parse(hydrateScript + '}');

  const comments = result.ratingAndReviewResponse.ratingAndReview.productReviews.content;

  const commentBag = [];
  comments.forEach((comment) => {
    commentBag.push(comment.comment);
  });

  return commentBag.join("\n\n");
}

const chatCompletion = async (message) => {
  let payload = {
    model: PROVIDER.defaultModel,
    messages: [
      {
        role: "system",
        content: INSTRUCTION,
      },
      {
        role: "user",
        content: message,
      }
    ]
  }

  if (DEFAULT_PROVIDER === 'openai') {
    payload.response_format = {type: 'json_object'};
  }

  const response = await fetch(PROVIDER.apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PROVIDER.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return JSON.parse(data.choices[0].message.content);
}

const addLabelsWidget = (labels) => {
  const labelWidget = document.createElement('div');
  labelWidget.className = 'seller-widget widget';

  const outputHTML = `<strong style="display: block; margin-bottom: 1rem; border-bottom: 1px solid #ddd; padding-bottom: 0.5rem;">ÖZELLİKLER</strong>`;
  const labelsHTML = `${labels.map(item => `<span style="display: block;margin-bottom: 8px;color: #007BFF;font-weight: bold;">${item}</span>`).join('')}`;

  labelWidget.innerHTML = `${outputHTML} ${labelsHTML}`;

  const targetDiv = document.querySelector('.seller-widget.widget');

  targetDiv?.parentNode.insertBefore(labelWidget, targetDiv);
}

initExtension();
