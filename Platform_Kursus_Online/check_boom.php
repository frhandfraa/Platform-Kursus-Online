<?php
// Cek semua file PHP di proyek untuk BOM
function checkBOM($dir) {
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    $bomFiles = [];
    foreach ($files as $file) {
        if ($file->isFile() && $file->getExtension() == 'php') {
            $content = file_get_contents($file->getRealPath());
            if (substr($content, 0, 3) == "\xEF\xBB\xBF") {
                $bomFiles[] = $file->getRealPath();
            }
        }
    }
    return $bomFiles;
}

$bom = checkBOM(__DIR__);
if (empty($bom)) {
    echo "Tidak ada file dengan BOM.\n";
} else {
    echo "File dengan BOM ditemukan:\n";
    foreach ($bom as $file) {
        echo $file . "\n";
    }
}
?>