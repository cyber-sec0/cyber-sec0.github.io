Office.onReady(() => {
  document.getElementById("searchBtn").onclick = () => {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
      //check-if-succeeded
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        //load-word-in-iframe
        document.getElementById("hippoFrame").src = "https://www.wordhippo.com/what-is/another-word-for/" + encodeURIComponent(result.value.trim()) + ".html";
      }
    });
  };
});