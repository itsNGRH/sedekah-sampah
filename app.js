const JSON_URL =
  'https://docs.google.com/spreadsheets/d/1ju7wKWz6H-1HONo0c05wVpgN_ofW6iHzdv5FlTQ1AQA/gviz/tq?tqx=out:json';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ju7wKWz6H-1HONo0c05wVpgN_ofW6iHzdv5FlTQ1AQA/edit?usp=sharing';

fetch(JSON_URL)
  .then(res => res.text())
  .then(text => {
    // Google bungkus JSON dalam function call → harus dipotong
    const json = JSON.parse(
      text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
    );

    const rows = json.table.rows;

    let totalMasuk = 0;
    let totalKeluar = 0;

    const data = rows.map(r => {
        const jenisRaw = r.c[1]?.v || '';
        const jenis = jenisRaw.toLowerCase();

        return {
            tanggalRaw: r.c[0]?.v,
            tanggalText: r.c[0]?.f,
            jenis,
            jenisLabel: jenisRaw,
            kategori: r.c[2]?.v,
            keterangan: r.c[3]?.v,
            jumlah: r.c[4]?.v || 0
        };
    });


    data.forEach(d => {
      if (d.jenis === 'masuk') totalMasuk += d.jumlah;
      if (d.jenis === 'keluar') totalKeluar += d.jumlah;
    });

    const saldo = totalMasuk - totalKeluar;

    document.getElementById('saldo').innerText =
      'Rp ' + saldo.toLocaleString('id-ID');

    document.getElementById('masuk').innerText =
      'Rp ' + totalMasuk.toLocaleString('id-ID');

    document.getElementById('keluar').innerText =
      'Rp ' + totalKeluar.toLocaleString('id-ID');

    const tbody = document.getElementById('tabel-transaksi');
        tbody.innerHTML = '';

    data
        .sort((a, b) => parseGvizDate(b.tanggalRaw) - parseGvizDate(a.tanggalRaw))
        .slice(0, 10)
        .forEach(d => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${d.tanggalText}</td>
                <td>${d.jenisLabel}</td>
                <td>${d.kategori || '-'}</td>
                <td>${d.keterangan || '-'}</td>
                <td class="${d.jenis}">
                    Rp ${d.jumlah.toLocaleString('id-ID')}
                </td>
            `;

            tbody.appendChild(tr);
        });

    document.getElementById('link-sheet').href = SHEET_URL;

    const latestDate = data
        .map(d => parseGvizDate(d.tanggalRaw))
        .filter(d => d)
        .sort((a, b) => b - a)[0];

    document.getElementById('last-update').innerText =
        'Diperbarui: ' +
        latestDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
  });

function parseGvizDate(value) {
  // contoh: "Date(2025,1,2)"
  const match = /Date\((\d+),(\d+),(\d+)\)/.exec(value);
  if (!match) return null;
  return new Date(match[1], match[2], match[3]);
}
