$(function() {
    let [, model] = window.location.hash.split('#');
    const {models, limit, url, deletable, editable} = $('body').data();
    const renderActions = () => {
        return `<div class="btn-group btn-group-sm" role="group">
            ${
                editable
                    ? '<button type="button" class="btn btn-light edit" data-toggle="modal" data-target="#edit"><i class="fas fa-edit"></i></button>'
                    : ''
            }
            ${
                deletable
                    ? '<button type="button" class="btn btn-danger delete"><i class="fas fa-trash"></i></button>'
                    : ''
            }
        </div>`;
    };
    const reload = () =>
        $('#tableContainer')
            .find('table')
            .DataTable()
            .ajax.reload(null, false);

    $(document)
        .on('click', 'a.dropdown-item[data-model]', function() {
            ({model} = $(this).data());
            $('#navbarDropdownMenuLink').text(model);
            $('#tableContainer table').each(function() {
                $(this)
                    .DataTable()
                    .destroy(true);
            });
            $('<table class="table">')
                .appendTo('#tableContainer')
                .DataTable({
                    fnCreatedRow: (row, {id}) => $(row).data({id}),
                    pageLength: limit,
                    lengthChange: false,
                    responsive: true,
                    processing: true,
                    serverSide: true,
                    searching: false,
                    paging: true,
                    ajax: {url, type: 'POST', data: {model}},
                    columns: models[model].concat(
                        deletable || editable ? {title: 'Actions', render: renderActions} : []
                    ),
                });
        })
        .on('click', 'button.delete', async function() {
            const {id} = $(this)
                .closest('tr')
                .data();
            if (!confirm(`Delete item #${id}?`)) return;
            await $.post(`${url}/delete/${id}?model=${model}`);
            reload();
        })
        .on('click', 'button.save', async function() {
            const form = $(this)
                .closest('.modal-content')
                .find('form');
            form.find('textarea.json').each(function() {
                const {cm} = $(this).data();
                cm.save();
            });
            await $.post(form.data('url'), form.serialize());
            $(this)
                .closest('.modal')
                .modal('hide');
            reload();
        })
        .on('show.bs.modal', '#edit', function(e) {
            const {id} = $(e.relatedTarget)
                .closest('tr')
                .data();
            $(this)
                .find('.modal-body')
                .html('<p>Loading...</p>')
                .load(`${url}/edit/${id}?model=${model}`, function() {
                    $(this)
                        .find('textarea.json')
                        .each(function() {
                            $(this).data(
                                'cm',
                                window.CodeMirror.fromTextArea(this, {lineNumbers: true, mode: 'javascript'})
                            );
                        });
                });
        });
    if (model) $(`a.dropdown-item[data-model="${model}"]`).click();
});
