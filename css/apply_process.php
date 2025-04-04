<?php

use PhpOffice\PhpWord\IOFactory;
use Smalot\PdfParser\Parser;

require "../../database/connection.php";
require "authenticate.php";
require "user_logged.php";

require '../../vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $applied_job_id = $_POST['job_id'];

    $street = $userInfo['street'];
    $city = $userInfo['city'];
    $province = $userInfo['province'];
    $postal_code = $userInfo['postal_code'];
    $status = $userInfo['status'];
    $home_phone = $userInfo['home_phone'];
    $facebook_link = $userInfo['facebook_link'];

    // retrieve data from database using job id 
    $jobData = $conn->query("SELECT * FROM jobs WHERE job_id = $applied_job_id");
    $job = $jobData->fetch_assoc();

    // Retrieve job from query
    $jobPosition = $job['job_position'];
    $jobMinimumEducation = $job['education'];
    $jobMinimumProgram = $job['program'];
    $jobMinimumTraining = $job['training'];
    $jobMinimumExperience = $job['experience'];
    $jobMinimumEligibility = $job['eligibility'];
    $jobMinimumCompetency = $job['competency'];
    $jobDescription = $job['job_description'];

    // Applicant Qualifications
    $competency = $userInfo['competency'];
    $skills = $userInfo['skills'];

    $applicantPds = $userInfo['file_pds'];
    $applicantRating = $userInfo['file_rating'];
    $applicantTor = $userInfo['file_tor'];
    $applicantTraining = json_encode($userInfo['file_training_cert']);
    $applicantEligibility = json_encode($userInfo['file_eligibility_cert']);

    $decoded_experience = json_decode($userInfo['experience'], true);
    $decoded_education = json_decode($userInfo['education'], true);
    $decoded_eligibility = json_decode(json_decode($userInfo['eligibility'], true), true);
    $decoded_training = json_decode(json_decode($userInfo['training'], true), true);
    
    $experience_html = '';
    $eligibility_html = '';
    $training_html = '';
    $education_html = '';
    
    // Check if $decoded_experience is an array and not empty before looping
    if (!empty($decoded_experience) && is_array($decoded_experience)) {
        foreach ($decoded_experience as $exp) {
            $experience_html .= $exp['job'] . " - " . $exp['experience'] . ", \n";
        }
    }
    
    // Check if $decoded_eligibility is an array and not empty before looping
    if (!empty($decoded_eligibility) && is_array($decoded_eligibility)) {
        foreach ($decoded_eligibility as $el) {
            $eligibility_html .= $el['eligibility_name'] . " - " . $el['date'] . ", \n";
        }
    }
    
    // Check if $decoded_training is an array and not empty before looping
    if (!empty($decoded_training) && is_array($decoded_training)) {
        foreach ($decoded_training as $train) {
            $training_html .= $train['training'] . " - (" . $train['start_date'] . " - " . $train['end_date']. "), \n";
        }
    }   
    
      // Check if $decoded_training is an array and not empty before looping
      if (!empty($decoded_education) && is_array($decoded_education)) {
        foreach ($decoded_education as $edu) {
            if($edu['education_name'] === "Elementary" || $edu['education_name'] === "High School"){
                $education_html.= $edu['education_name'] . "(" . $edu['year_start']. "-" . $edu['year_end']. ")". ", \n";
            }else {
                $education_html.= $edu['education_name']. " - ". $edu['program'] . "(" . $edu['year_start']. "-" . $edu['year_end']. ")". ", \n";
            }
            }
        } 

    $upload_dir = "../../uploads/"; // Directory where existing files are stored
    $upload_applicant_dir = "../../uploads/applicants/"; // New directory for applicants
    
    // Ensure correct file paths for pre-existing files
    $filepds = !empty($userInfo['file_pds']) ? $upload_dir . $userInfo['file_pds'] : '';
    $filerating = !empty($userInfo['file_rating']) ? $upload_dir . $userInfo['file_rating'] : '';
    $filetor = !empty($userInfo['file_tor']) ? $upload_dir . $userInfo['file_tor'] : '';
    
    // Decode JSON safely
    $filecertificates = !empty($userInfo['file_eligibility_cert']) ? json_decode($userInfo['file_eligibility_cert'], true) : [];
    $filecertificatesTraining = !empty($userInfo['file_training_cert']) ? json_decode($userInfo['file_training_cert'], true) : [];
    
    // If JSON decoding fails, handle it
    if (json_last_error() !== JSON_ERROR_NONE) {
        die("Error decoding JSON: " . json_last_error_msg());
    }
    
    // Convert filenames to full paths
    $filecertificate_paths = array_map(fn($file) => $upload_dir . $file, (array)$filecertificates);
    $filecertificateTraining_paths = array_map(fn($file) => $upload_dir . $file, (array)$filecertificatesTraining);
    
    // Function to copy existing files to the new directory
    function copyExistingFiles($file_paths, $destination_dir) {
        $copied_files = [];

        // Ensure $file_paths is always an array
        $file_paths = is_array($file_paths) ? $file_paths : [$file_paths];

        foreach ($file_paths as $file) {
            if (!empty($file) && file_exists($file)) {
                $new_file_path = $destination_dir . basename($file);
                if (copy($file, $new_file_path)) {
                    $copied_files[] = $new_file_path;
                } else {
                    echo "Failed to copy: $file <br>";
                }
            }
        }
        return $copied_files;
    }
    
    // Copy existing files to uploads/applicants/
    $copied_certificates = copyExistingFiles($filecertificate_paths, $upload_applicant_dir);
    $copied_certificatesTraining = copyExistingFiles($filecertificateTraining_paths, $upload_applicant_dir);
    $filepds_new = copyExistingFiles($filepds, $upload_applicant_dir);
    $filerating_new = copyExistingFiles($filerating, $upload_applicant_dir);
    $filetor_new = copyExistingFiles($filetor, $upload_applicant_dir);
    
    // // Function to upload new files
    // function uploadFile($file, $upload_dir) {
    //     if (!$file || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
    //         return false;
    //     }
    
    //     $file_name = basename($file['name']);
    //     $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    //     $allowed_types = ["pdf", "doc", "docx"];
    
    //     if (!in_array($file_ext, $allowed_types)) {
    //         return false; // Invalid file type
    //     }
    
    //     // Generate a unique file name
    //     $unique_file_name = uniqid(time() . '_', true) . '.' . $file_ext;
    //     $target_file = $upload_dir . $unique_file_name;
    
    //     return move_uploaded_file($file['tmp_name'], $target_file) ? $unique_file_name : false;
    // }
    
    // // Function to upload multiple new files
    // function uploadMultipleFiles($files, $upload_dir) {
    //     $file_paths = [];
    
    //     if (!$files || !isset($files['name']) || !is_array($files['name'])) {
    //         return []; // No files uploaded
    //     }
    
    //     foreach ($files['name'] as $index => $name) {
    //         if ($files['error'][$index] !== UPLOAD_ERR_OK) {
    //             continue; // Skip if file has an error
    //         }
    
    //         $file = [
    //             'name' => $files['name'][$index],
    //             'type' => $files['type'][$index],
    //             'tmp_name' => $files['tmp_name'][$index],
    //             'error' => $files['error'][$index],
    //             'size' => $files['size'][$index]
    //         ];
    
    //         $uploaded_path = uploadFile($file, $upload_dir);
    //         if ($uploaded_path) {
    //             $file_paths[] = $uploaded_path;
    //         }
    //     }
    //     return $file_paths;
    // }
    
    // // Upload new files if provided
    // $fileeligibilityFiles = $_FILES['eligibility_files'] ?? null;
    // $filetrainingFiles = $_FILES['training_files'] ?? null;
    
    // $new_filecertificate_paths = $fileeligibilityFiles ? uploadMultipleFiles($fileeligibilityFiles, $upload_applicant_dir) : [];
    // $new_filecertificateTraining_paths = $filetrainingFiles ? uploadMultipleFiles($filetrainingFiles, $upload_applicant_dir) : [];
    
    // // Combine copied and newly uploaded files
    // $final_certificates = array_merge($copied_certificates, $new_filecertificate_paths);
    // $final_certificatesTraining = array_merge($copied_certificatesTraining, $new_filecertificateTraining_paths);
    
    // // Normalize paths before encoding
    // $final_certificates = array_map(fn($file) => str_replace("\\", "/", $file), $final_certificates);
    // $final_certificatesTraining = array_map(fn($file) => str_replace("\\", "/", $file), $final_certificatesTraining);
    
    // // Convert to JSON for database storage
    // $filecertificate_paths_json = json_encode($final_certificates, JSON_UNESCAPED_SLASHES);
    // $filecertificateTraining_paths_json = json_encode($final_certificatesTraining, JSON_UNESCAPED_SLASHES);
    
    // // Final Debugging Output
    // echo "<pre>";
    // print_r($filecertificate_paths_json);
    // print_r($filecertificateTraining_paths_json);
    // echo "</pre>";
    

    // echo "<script>console.log('File Certificate Paths: " . json_encode($new_filecertificate_paths) . "');</script>";
    // echo "<script>console.log('File Certificate Training Paths: " . json_encode($new_filecertificateTraining_paths) . "');</script>";

    // Function to parse documents (PDF, DOCX)
    function parseFileToText($filePath)
    {
        if($filePath === null){
            return;
        }

        $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $text = '';

        if ($fileExtension == "pdf") {

            $parser = new Parser();
            try {
                $pdf = $parser->parseFile($filePath);
                $text = $pdf->getText();

                // Sanitize and escape the text for use in JavaScript
                $jsonText = json_encode($text);
            } catch (Exception $e) {
                error_log('Error parsing PDF: ' . $e->getMessage());
            }
        } elseif ($fileExtension == "docx" || $fileExtension == "doc") {
            try {
                $phpWord = IOFactory::load($filePath);
                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        // Check if the element is a Text element
                        if ($element instanceof \PhpOffice\PhpWord\Element\Text) {
                            $text .= $element->getText() . "\n";
                        }
                        // handle multiple text elements. if daghay text element kani ang e run
                        elseif ($element instanceof \PhpOffice\PhpWord\Element\TextRun) {
                            // for each text element sa group of element which also called textRun 
                            // iyang e loop
                            foreach ($element->getElements() as $subElement) {
                                // subElement is mao naning text element and ang e consider nga text element is 
                                // before magka new line 
                                if ($subElement instanceof \PhpOffice\PhpWord\Element\Text) {
                                    $text .= $subElement->getText();
                                }
                            }
                            // after each text element mag add tag new line
                            $text .= "\n";
                        }
                    }
                }

                // Sanitize and escape the text for use in JavaScript
                $jsonText = json_encode($text);
                // echo "<script>console.log('Parsed DOCX Text: " . $jsonText . "');</script>";
            } catch (Exception $e) {
                error_log('Error parsing DOC/DOCX: ' . $e->getMessage());
            }
        }

        return $text;
    }

    $minimumQualification = [
        "training certificates" => $job['training'] ?? '',
        "eligibility" => $job['eligibility'] ?? '',
        "competency" => $job['competency'] ?? '',
        "skills" => $job['skills'] ?? '',
        "education" => ($job['education'] ?? '') . ' - ' . ($job['program'] ?? ''),
        "experience" => $job['experience'] ?? '',
        "tor" => "*Transcript of Records (TOR):* Verify academic history, degrees earned, relevance to qualifications, and evaluate the grades.",
        "pr" => "*Performance Rating (PR):* Assess work performance, ratings, and consistency over time. ",
    ];

    $minQualifications_html = "";

    foreach ($minimumQualification as $qualificationType => $qualification) {
        if (!empty($qualification)) {
            $minQualifications_html .= "<b>" . ucfirst($qualificationType) . ":</b> " . $qualification . "<br>";
        }
    }

    echo "<script>console.log('Job Qualification: " . json_encode($minimumQualification) . "');</script>";

    $applicantQualification = [
        "training certificates" => $training_html ?? 'None',
        "eligibility" => $eligibility_html ?? 'None',
        "competency" => $userInfo['competency'] ?? 'None',
        "skills" => $userInfo['skills'] ?? 'None',
        "education" => $education_html ?? 'None',
        "experience" => $experience_html ?? 'None',
    ];

    echo "<script>console.log('Applicant Qualification: " . json_encode($applicantQualification) . "');</script>";

    $qualificationPoints = [
        "training certificates" => $job['training_max_points'],
        "eligibility" => $job['eligibility_max_points'],
        "competency" => $job['competency_max_points'],
        "skills" => $job['skills_max_points'],
        "education" => $job['education_max_points'],
        "experience" => $job['experience_max_points'],
        "tor" => $job['tor_max_points'],
        "pr" => $job['pr_max_points'],
    ];

    function analyzeQualificationsWithGemini($applicantQualification, $minimumQualification, $maxQualificationPoints, $jobPosition, $jobDescription, $category)
    {
        $apiKey = 'AIzaSyACF3a4t3vX7gl4x2VjPS1izRDcl09BzYk';

        $prompt = "Conduct a rigorous evaluation of the applicant's qualifications for the '$jobPosition' position. 

        ### Position Details:
        - Job Title: $jobPosition
        - Job Description: $jobDescription
        - Evaluation Category: $category
        
        ### Evaluation Parameters:
        [MINIMUM REQUIREMENT] $minimumQualification
        [APPLICANT'S QUALIFICATION] $applicantQualification
        [MAXIMUM POINTS AVAILABLE] $maxQualificationPoints
        
        ### Scoring Matrix:
        1. Exact Match to Requirements:
           - 100% of maximum points ($maxQualificationPoints)
        
        2. Exceeds Requirements:
           - 100-120% of maximum points (with justification)
        
        3. Partially Meets Requirements:
           - 25-75% of maximum points (proportional to relevance)
        
        4. Does Not Meet Requirements:
           - 0% (zero points)
        
        ### Document Content Verification:
        [FOR TOR/PR DOCUMENTS]
        ✓ Language Validation: Must be English/Tagalog
        ✓ Content Relevance: Directly related to $jobPosition
        ✓ Authenticity Check: No gibberish/copied content
        
        ### Strict Evaluation Protocol:
        1. Language Compliance:
           - Automatic disqualification for:
             * Non-English/Tagalog content
             * Untranslated foreign text
             * Spanish content
             * Unreadable/gibberish text
        
        2. Content Validation:
           - Zero tolerance for:
             * Fabricated qualifications
             * Generic/unsubstantiated claims
             * Irrelevant competencies
             * Mismatched document content
        
        3. Scoring Precision:
           - Points deducted for:
             * Missing key requirements
             * Partial compliance
             * Unverified claims
           - Points added for:
             * Demonstrated excellence
             * Additional relevant qualifications
             * Verified exceptional performance
        
        ### Special Case Handling:
        - Performance Rating (PR):
          ✓ Must show 3+ consistent performance periods
          ✓ Should demonstrate progressive improvement
        
        - Transcript of Records (TOR):
          ✓ Must show relevant coursework
          ✓ Should demonstrate required competencies
        
        ### Response Format Requirement:
        ---BEGIN FORMAT---
        score: [numeric value between 0-$maxQualificationPoints]
        Interpretation: [concise 15-25 word explanation of scoring rationale]
        ---END FORMAT---
        
        ### Final Instructions:
        1. Apply scoring matrix strictly
        2. Validate all document content
        3. Enforce language rules absolutely
        4. Provide numeric score first
        5. Follow with brief interpretation
        6. Maintain zero tolerance for violations";
        $data = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ]
        ];

        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $apiKey);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        if ($response === false) {
            error_log('Curl error: ' . curl_error($ch));
            curl_close($ch);
            return 0;
        }

        curl_close($ch);

        $decodedResponse = json_decode($response, true);
        $textResponse = $decodedResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Parse the response
        $score = 0;
        $interpretation = 'No evaluation provided';
        
        if (preg_match('/score:\s*([0-9.]+)/i', $textResponse, $scoreMatches)) {
            $score = min(max((float)$scoreMatches[1], 0), $maxQualificationPoints);
        }
        
        if (preg_match('/Interpretation:\s*(.+?)(?=\n|$)/i', $textResponse, $interpretationMatches)) {
            $interpretation = trim($interpretationMatches[1]);
        }
    
        return [
            'score' => $score,
            'interpretation' => $interpretation
        ];
    }

    function analyzeDocumentWithGemini($parseText, $jobPosition, $jobDescription, $category, $minQualifications)
    {
        if(empty($parseText)){
            return;
        }

        $apiKey = 'AIzaSyACF3a4t3vX7gl4x2VjPS1izRDcl09BzYk';

        $prompt = "Analyze the provided document only if it belongs to one of the following categories: Transcript of Records (TOR), Performance Rating (PR), or Personal Data Sheet (PDS). The Job: $jobPosition -  $jobDescription.  
        Minimum Qualifications: 
        $minQualifications

        *Expected Document Category:* $category  
        *Applicant's Document Content:*  
        $parseText  

        If the document does not match the expected category exactly, do not analyze it. Instead, state that the document is not related to the expected category.  

        If it matches, evaluate the document based on its intended purpose:  
        - *Transcript of Records (TOR):* Verify academic history, degrees earned, relevance to qualifications, and evaluate the grades.  
        - *Performance Rating (PR):* Assess work performance, ratings, and consistency over time.  
        - *Personal Data Sheet (PDS):* Check for completeness, accuracy of personal/work history, and alignment with required details.  
        
        Ensure the response is written in clear, structured sentences without using special symbols such as asterisks, bullets, or any non-alphanumeric characters for formatting.";  

        $data = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ]
        ];

        $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $apiKey);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);

        if ($response === false) {
            error_log('Curl error: ' . curl_error($ch));
            curl_close($ch);
            return;
        }

        curl_close($ch);

        $decodedResponse = json_decode($response, true);

        if (isset($decodedResponse['candidates'][0]['content']['parts'][0]['text'])) {
            $responseText = trim($decodedResponse['candidates'][0]['content']['parts'][0]['text']);
        
            return $responseText;
        }
        return;
    }

  $scores = [];   
$maxPoints = []; 
$interpretations = [];

foreach ($minimumQualification as $index => $minRequirement) {
    if($index !== "tor" && $index !== "pr") {
        $applicantData = $applicantQualification[$index] ?? '';
    } else {
        if($index === "tor") {
            $fileToParse = $filetor ?? '';
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            $extension = strtolower(pathinfo($fileToParse, PATHINFO_EXTENSION));
            
            if (in_array($extension, $imageExtensions)) {
                $parsedText = getTextByImage($fileToParse);
            } else {
                $parsedText = parseFileToText($fileToParse);
            }
            $applicantData = $parsedText;
        } elseif($index === "pr") {
            $fileToParse = $filerating ?? '';
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            $extension = strtolower(pathinfo($fileToParse, PATHINFO_EXTENSION));
            
            if (in_array($extension, $imageExtensions)) {
                $parsedText = getTextByImage($fileToParse);
            } else {
                $parsedText = parseFileToText($fileToParse);
            }
            $applicantData = $parsedText;
        }
    }
    
    $maxQualificationPoints = $qualificationPoints[$index] ?? '';
    $score = analyzeQualificationsWithGemini(
        $applicantData,
        $minRequirement,
        $maxQualificationPoints,
        $jobPosition,
        $jobDescription,
        $index
    );

    $maxPoints[$index] = $maxQualificationPoints;
    $scores[$index] = $score['score']; 

    // Log the score for debugging
    echo "<script>console.log('Score for $index: " . $score['interpretation'] . "');</script>";

    // Set the interpretation based on index
    if ($index === "tor") {
        $interpretations[] = [
            'index' => 'Transcript of Records', 
            'interpretation' => $score['interpretation']
        ];
    } elseif ($index === "pr") { 
        $interpretations[] = [
            'index' => 'Performance Rating', 
            'interpretation' => $score['interpretation']
        ];
    } else {
        $interpretations[] = [
            'index' => $index, 
            'interpretation' => $score['interpretation']
        ];
    }
}

$interpretationText = '';
// Build the interpretation text
if (!empty($interpretations)) {
    foreach ($interpretations as $interpretation) {
        if (isset($interpretation['index']) && isset($interpretation['interpretation'])) {
            $interpretation['index'] = ucfirst(strtolower($interpretation['index']));
            $interpretationText .= $interpretation['index'] . " - " . $interpretation['interpretation'] . "\n";
        }
    }
}

function getTextByImage($imagePath) {
    $api_url = 'https://api.api-ninjas.com/v1/imagetotext';
    $api_key = 'egqRwieU3KPaNcxOHU3TVw==vQHqgqVeEqLfpNcX';

    if (!file_exists($imagePath)) {
        return false;
    }

    $image_file = new CURLFile($imagePath, mime_content_type($imagePath), basename($imagePath));

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, ['image' => $image_file]);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-Api-Key: ' . $api_key]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        curl_close($ch);
        return false;
    }

    curl_close($ch);
    $result = json_decode($response, true);

   
    $text = '';
    $currentLine = '';
    $previousWord = '';
    $spaceThreshold = 5;

    foreach ($result as $item) {
        if (!isset($item['text'])) {
            continue;
        }

        $word = $item['text'];
        $wordLength = strlen($word);
        
        $isHeading = (strtoupper($word) === $word && $wordLength > 1) || 
                    str_ends_with($word, ':') || 
                    (ctype_upper(substr($word, 0, 1)) && !preg_match('/[a-z]/', substr($word, 1)));

        $isListItem = preg_match('/^[•▪♦➢➣⦿◦\d+\.]/u', $word);
        
        $hasLargeSpace = isset($item['x']) && isset($previousWord['x']) && 
                        ($item['x'] - ($previousWord['x'] + $previousWord['width']) > $spaceThreshold);


        $shouldBreak = !empty($currentLine) && 
                      ($isHeading || 
                       $isListItem || 
                       $hasLargeSpace || 
                       (str_ends_with($previousWord, '.') && ctype_upper(substr($word, 0, 1))));

        if ($shouldBreak) {
            $text .= trim($currentLine) . "\n\n";
            $currentLine = '';
        }
        elseif (!empty($currentLine)) {
            $currentLine .= ' ';
        }

        $currentLine .= $word;
        $previousWord = $word;
        
        if (isset($item['x']) && isset($item['width'])) {
            $previousWord['x'] = $item['x'];
            $previousWord['width'] = $item['width'];
        }
    }

    $text .= trim($currentLine);

    $text = preg_replace("/\n{3,}/", "\n\n", trim($text));
    $text = preg_replace('/[ \t]+/', ' ', $text);

    return $text;
}

/**
 * Enhanced text formatting function
 */
function formatOcrText($rawText) {
    // Normalize line breaks and spaces
    $text = preg_replace('/\r\n?/', "\n", $rawText);
    $text = preg_replace('/[ \t]+/', ' ', $text);
    
    // Split into lines for processing
    $lines = explode("\n", $text);
    $formattedLines = [];
    $previousLine = '';
    
    foreach ($lines as $line) {
        $trimmedLine = trim($line);
        if (empty($trimmedLine)) continue;
        
        // Detect headings (all caps or ending with 🙂
        $isHeading = (strtoupper($trimmedLine) === $trimmedLine && strlen($trimmedLine) > 3) || 
                    str_ends_with($trimmedLine, ':');
        
        // Detect list items
        $isListItem = preg_match('/^[•▪♦➢➣⦿◦\d+\.]/u', $trimmedLine);
        
        // Add extra line breaks before headings/list items
        if ($isHeading || $isListItem) {
            if (!empty($previousLine) && !preg_match('/[.!?]$/', $previousLine)) {
                $formattedLines[] = '';
            }
            $formattedLines[] = $trimmedLine;
            $formattedLines[] = '';
        } 
        // Merge short lines with previous line
        elseif (strlen($trimmedLine) < 40 && !empty($previousLine) && !preg_match('/[.!?]$/', $previousLine)) {
            $formattedLines[count($formattedLines) - 1] .= ' ' . $trimmedLine;
        } else {
            $formattedLines[] = $trimmedLine;
        }
        
        $previousLine = $trimmedLine;
    }
    
    // Combine lines with proper spacing
    $text = implode("\n", $formattedLines);
    
    // Clean up excessive empty lines
    $text = preg_replace("/\n{3,}/", "\n\n", $text);
    
    return trim($text);
}

    function getExplanation($file, $jobPosition, $jobDescription, $category, $minQualifications_html) {
        // Check if file is an image
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    
        if (in_array($extension, $imageExtensions)) {
            $parsedText = getTextByImage($file);
            echo "<script>console.log('Image to Text: " . $parsedText . "');</script>";
        } else {
            $parsedText = parseFileToText($file);

        }
    
        return $parsedText ? analyzeDocumentWithGemini($parsedText, $jobPosition, $jobDescription, $category, $minQualifications_html) : "Could not extract text from the file";
    }
    
    $explanationPds = getExplanation($filepds, $jobPosition, $jobDescription, "Personal Data Sheet(PDS)", $minQualifications_html);
    $explanationRating = getExplanation($filerating, $jobPosition, $jobDescription, "Performance Rating(PR)" , $minQualifications_html);
    $explanationTor = getExplanation($filetor, $jobPosition, $jobDescription, "Transcript of Records(TOR)" ,$minQualifications_html);

    // Calculate the final qualification score
    $finalQualificationScore = array_sum($scores); 
    $maxPointsTotal = array_sum($maxPoints); 

    $finalRating = ($finalQualificationScore / $maxPointsTotal) * 100;
    
    $insert_sql = $conn->prepare("INSERT INTO job_applicants`(applied_applicant_id`, applied_job_id, streets, city, province, postal_code, applied_status, home_phone, facebook_link, applied_education, applied_training, applied_experience, applied_eligibility, applied_competency, applied_file_pds, applied_file_rating, applied_file_certificate, applied_file_training_cert, applied_file_tor, applied_ratings, applied_skills, applied_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

    // Bind parameters to the SQL query
    $insert_sql->bind_param("iisssssssssssssssssds", $userId, $applied_job_id, $street, $city, $province, $postal_code, $status, $home_phone, $facebook_link, $education_html, $training_html, $experience_html, $eligibility_html, $competency, $applicantPds, $applicantRating, $applicantEligibility, $applicantTraining, $applicantTor, $finalRating, $skills);

    if ($insert_sql->execute()) {
        $applied_id = $conn->insert_id;
        $education_score = $scores['education'] ?? 0.00;
        $training_certifates_score = $scores['training certificates'] ?? 0.00;
        $experience_score = $scores['experience'] ?? 0.00;
        $eligibility_score = $scores['eligibility'] ?? 0.00;
        $competency_score = $scores['competency'] ?? 0.00;
        $skills_score = $scores['skills'] ?? 0.00;
        $tor_score = $scores['tor'] ?? 0.00;
        $rating_score = $scores['pr'] ?? 0.00;

        $insert_scores_sql = $conn->prepare("
        INSERT INTO applicant_scores (
            applicants_id, 
            applied_id, 
            education_points, 
            training_points, 
            experience_points, 
            eligibility_points, 
            competency_points,
            skill_points,
            tor_points,
            rating_points,
            ai_pds_explanation,
            ai_rating_explanation,
            ai_tor_explanation,
            scores_interpretation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

        $insert_scores_sql->bind_param(
            "iiddddddddssss",
            $userId,
            $applied_id,
            $education_score,
            $training_certifates_score,
            $experience_score,
            $eligibility_score,
            $competency_score,
            $skills_score,
            $tor_score,
            $rating_score,
            $explanationPds,
            $explanationRating,
            $explanationTor,
            $interpretationText
        );

        if ($insert_scores_sql->execute()) {
            echo '<script>alert("Successfully Submitted."); window.location.href = "http://localhost/smarthr/applicant/applications.php"</script>';
        } else {
            error_log('Error inserting scores: ' . $insert_scores_sql->error);
            echo 'Error inserting scores: ' . $insert_scores_sql->error;
        }
    } else {
        error_log('Error inserting applicant data: ' . $insert_sql->error);
        echo 'Error inserting applicant data: ' . $insert_sql->error;
    }
}

