'use strict'

var baseurl = "https://steffen.maeland.gitlab.io/reference-manager/"

$(document).ready(function() {
    $('#example').DataTable({
        "ajax": "data.json",
        columns: [
            {
                data: "title",
                render: function(data) {
                    let max_length = 75;
                    if (data.length > max_length) {
                        return data.slice(0, max_length-3) + '...'
                    }
                    return data
                }
            },
            {
                data: "author",
                render: function(data) {
                    data = data.replace(/\sand/g, ',')    
                    let num_authors = (data.match(/,/g) || []).length;
                    if (num_authors > 3) {
                        return data.split(',')[0] + ' et al.'
                    }
                    return data
                }
            },
            {
                data: "year"
            },
            {
                data: "tags",
                render: function(data) {
                    return data.join(', ')
                }
            },
            {
                data: "uri",
                render: function(data, type) {
                    if (type === 'display') {
                        let domain = data.split('/')[2]
                        return '<a href="' + data + '">' + domain + '</a>';
                    }
                    return data;
                }
            },
            {
                data: "pdf",
                render: function(data, type) {
                    if (type === 'display') {
                        return '<a href="' + baseurl + 'pdfs/' + data + '"><img src="icons/file-earmark-pdf.svg" width="22" height="22"></a>';
                    }
                    return data;
                }
            },
            {
                render: function(data, type, row) {
                    let searchterm = row['title'].replace(/\ /g, '%20')
                    let link = 'https://www.connectedpapers.com/search?q=' + searchterm
                    return '<a href="' + link + '" target="blank"><img src="icons/diagram-2.svg" width="22" height="22"></a>';
                }
            },
            {
                render: function(data, type, row) {
                    let searchterm = row['title'].replace(/\ /g, '%20')
                    let link = 'https://scholar.google.com/scholar?q=' + searchterm
                    return '<a href="' + link + '" target="blank"><img src="icons/Google_Scholar_logo.svg" width="22" height="22"></a>';
                }
            }
        ]
    });   
});
