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
                    return data.join(',')
                }
            },
            {
                data: "uri",
                render: function(data, type) {
                    if (type === 'display') {
                        return '<a href="' + data + '">URI</a>';
                    }
                    return data;
                }
            },
            {
                data: "pdf",
                render: function(data, type) {
                    if (type === 'display') {
                        return '<a href="' + baseurl + data + '">pdf</a>';
                    }
                    return data;
                }
            }
        ]
    });   
});
